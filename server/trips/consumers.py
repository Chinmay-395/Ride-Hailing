from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from trips.serializers import NestedTripSerializer, TripSerializer


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

    @database_sync_to_async
    def _create_trip(self, data):
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
            await self.accept()

    async def create_trip(self, message):
        data = message.get('data')
        trip = await self._create_trip(data)
        trip_data = await self._get_trip_data(trip)

        await self.send_json({
            'type': 'echo.message',
            'data': trip_data,
        })

    async def disconnect(self, code):
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
        await super().disconnect(code)

    async def echo_message(self, message):
        await self.send_json(message)

    async def receive_json(self, content, **kwargs):
        message_type = content.get('type')
        if message_type == 'create.trip':
            await self.create_trip(content)
        elif message_type == 'echo.message':
            await self.echo_message(content)
