from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from trips.serializers import NestedTripSerializer, TripSerializer
from trips.models import Trip


class TaxiConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, code):
        await super().disconnect(code)

    async def receive_json(self, content, **kwargs):
        message_type = content.get('type')
        # print("THE MESSAGE IS ====================", message_type)
        # print("\n")
        # print("THE CONTENT", content)
        # print("\n")
        if message_type == 'echo.message':
            await self.send_json({
                'type': message_type,
                'data': content.get('data'),
            })
        # return super().receive_json(content, **kwargs)


class TaxiConsumer(AsyncJsonWebsocketConsumer):
    groups = ['test']
    # the <groups> variable will define a channel-layer.
    # any client connected to the "TaxiConsumer" through WebSockets
    # will automatically be subscribed to the test group.

    @database_sync_to_async
    def _create_trip(self, data):
        """[summary]
        • When the user-defined function called create_trip is inovked
            it will send the necessary data to this function, so that
            everything inside the payload will be first checked by the
            "Tripserializer" and the database is updated with the validated data
        """
        serializer = TripSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.create(serializer.validated_data)

    # new
    @database_sync_to_async
    def _get_trip_data(self, trip):
        return NestedTripSerializer(trip).data

    @database_sync_to_async
    def _get_user_group(self, user):
        return user.groups.first().name

    @database_sync_to_async
    def _get_trip_ids(self, user):
        user_groups = user.groups.values_list('name', flat=True)
        if 'driver' in user_groups:
            trip_ids = user.trips_as_driver.exclude(
                status=Trip.COMPLETED
            ).only('id').values_list('id', flat=True)
        else:
            trip_ids = user.trips_as_rider.exclude(
                status=Trip.COMPLETED
            ).only('id').values_list('id', flat=True)
        return map(str, trip_ids)

    async def connect(self):
        user = self.scope['user']
        # this will not let anonymous user and close their connection
        if user.is_anonymous:
            await self.close()
        else:
            # we need to check if the user is a `driver`
            user_group = await self._get_user_group(user)
            if user_group == 'driver':
                await self.channel_layer.group_add(
                    group='drivers',
                    channel=self.channel_name
                )

            for trip_id in await self._get_trip_ids(user):
                await self.channel_layer.group_add(
                    group=trip_id,
                    channel=self.channel_name
                )
            await self.accept()

    async def create_trip(self, message):
        data = message.get('data')
        trip = await self._create_trip(data)
        trip_data = await self._get_trip_data(trip)

        # Send rider requests to all drivers in the diver-pool.
        await self.channel_layer.group_send(group='drivers', message={
            # the 'echo.message' will be converted to 'echo_message'
            # which is a user-defined function.
            'type': 'echo.message',
            'data': trip_data
        })

        # Add rider to trip group.
        await self.channel_layer.group_add(
            group=f'{trip.id}',
            channel=self.channel_name
        )

        await self.send_json({
            # the message that trip is created is broadcasted
            # (sent to the rider)
            'type': 'echo.message',
            'data': trip_data,
        })

    async def disconnect(self, code):
        """[summary]
            disconnect is websocket consumer function which gets invoked 
            whenever the socket disconnect.
        Args:
            self : this will give access to the "scope" of the websocket.
            code : this is basically websocket version of HTTP-error-code.
        """
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
        else:
            user_group = await self._get_user_group(user)
            if user_group == 'driver':
                await self.channel_layer.group_discard(
                    group='drivers',
                    channel=self.channel_name
                )

            for trip_id in await self._get_trip_ids(user):
                await self.channel_layer.group_discard(
                    group=trip_id,
                    channel=self.channel_name
                )
        await super().disconnect(code)

    async def echo_message(self, message):
        """
            When a channel layer sends a broadcast message with the type echo.message,
            Channels will execute the echo_message() function for everyone in 
            the test group.
        """
        await self.send_json(message)

    async def receive_json(self, content, **kwargs):
        """
        • The receive_json() function is responsible for processing all messages 
            that come to the server. 
        • Our message is an object with a type and a data payload. Passing a type 
            is a Channels convention that serves two purposes:
            1) It helps differentiate incoming messages and tells the server how to process
                them.
            2) The type maps directly to a consumer function when sent from another 
                channel layer. 
        """
        message_type = content.get('type')
        # 'create.trip' will be converted to "create_trip" which is a user-defined function
        if message_type == 'create.trip':
            await self.create_trip(content)
        elif message_type == 'echo.message':
            await self.echo_message(content)
