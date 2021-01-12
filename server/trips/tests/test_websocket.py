import pytest
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import Group

from taxi.routing import application
from trips.models import Trip

TEST_CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


@database_sync_to_async
def create_user(username, password, group='rider'):
    """[summary]
        • We need to refactor our other WebSocket tests to pass a 
            JWT access token in the query string when connecting
        • The moment a driver logs into our app, they join a pool 
            of drivers that can accept requests from riders. 
            We'll test this by creating a driver and logging them in, 
            sending a broadcast message to the driver group, and 
            confirming that the driver receives the message.    
    """
    # Create user.
    user = get_user_model().objects.create_user(
        username=username,
        password=password
    )

    # Create user group.
    user_group, _ = Group.objects.get_or_create(name=group)  # new
    user.groups.add(user_group)
    user.save()

    # Create access token.
    access = AccessToken.for_user(user)

    return user, access


@database_sync_to_async
def create_trip(
    pick_up_address='123 Main Street',
    drop_off_address='456 Piney Road',
    status='REQUESTED',
    rider=None,
    driver=None
):
    return Trip.objects.create(
        pick_up_address=pick_up_address,
        drop_off_address=drop_off_address,
        status=status,
        rider=rider,
        driver=driver
    )


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
class TestWebSocket:
    async def test_can_connect_to_server(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        _, access = await create_user(
            'test.user@example.com', 'pAssw0rd'
        )
        communicator = WebsocketCommunicator(
            # application is defined in the `routing.py` file
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()
        assert connected is True
        await communicator.disconnect()

    async def test_can_send_and_recieve_messages(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        _, access = await create_user(
            'test.user@example.com', 'pAssw0rd'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()
        message = {
            # type attribute would be the function we need to call
            # This will call the "echo_message" function in the consumers.py file
            # the dot would be converted into an underscore i.e.
            # echo.message ==> echo_message
            'type': 'echo.message',
            'data': "This is a test message.",
        }
        await communicator.send_json_to(message)
        response = await communicator.receive_json_from()
        assert response == message
        await communicator.disconnect()

    # async def test_can_send_and_receive_broadcast_messages(self, settings):
        # settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        # _, access = await create_user(
        #     'test.user@example.com', 'pAssw0rd'
        # )
        # communicator = WebsocketCommunicator(
        #     application=application,
        #     path=f'/taxi/?token={access}'
        # )
        # connected, _ = await communicator.connect()
        # message = {
        #     'type': 'echo.message',
        #     'data': 'This is a test message.',
        # }
        # channel_layer = get_channel_layer()
        # await channel_layer.group_send('test', message=message)
        # response = await communicator.receive_json_from()
        # assert response == message
        # await communicator.disconnect()

    async def test_cannot_connect_to_socket(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        communicator = WebsocketCommunicator(
            application=application,
            path='/taxi/'
        )
        connected, _ = await communicator.connect()
        assert connected is False
        await communicator.disconnect()

    async def test_join_driver_pool(self, settings):
        """[summary]
        • The below test will broadcast the message to all the drivers
            will create a different test to prove that drivers receive
            the broadcasted message.
        """
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        _, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'driver'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send('drivers', message=message)
        response = await communicator.receive_json_from()
        assert response == message
        await communicator.disconnect()

    async def test_request_trip(self, settings):
        """[summary]
        • When a rider requests a trip, the server will create
            a new Trip record and will broadcast the request to the driver pool. 
            But from the rider's perspective, they will only get a message back 
            confirming the creation of a new trip
        """
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()
        await communicator.send_json_to({
            'type': 'create.trip',
            'data': {
                'pick_up_address': '123 Main Street',
                'drop_off_address': '456 Piney Road',
                'rider': user.id,
            },
        })
        response = await communicator.receive_json_from()
        response_data = response.get('data')
        assert response_data['id'] is not None
        assert response_data['pick_up_address'] == '123 Main Street'
        assert response_data['drop_off_address'] == '456 Piney Road'
        assert response_data['status'] == 'REQUESTED'
        assert response_data['rider']['username'] == user.username
        assert response_data['driver'] is None
        await communicator.disconnect()

    async def test_driver_alerted_on_request(self, settings):
        """[summary]
        • We start off by creating a channel layer and adding it to the driver pool. 
        • Every message that's broadcast to the drivers group will be captured on the 
            test_channel. 
        • Next, we establish a connection to the server as a rider, and we send
            a new request message over the wire. 
        • Finally, we wait for the broadcast message to reach the drivers group, 
            and we confirm the identity of the rider who sent it.
        """
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        # Listen to the 'drivers' group test channel.
        channel_layer = get_channel_layer()
        await channel_layer.group_add(
            group='drivers',
            channel='test_channel'
        )
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        # establish a connection to the server as a rider
        connected, _ = await communicator.connect()

        # Request a trip.
        await communicator.send_json_to({
            'type': 'create.trip',
            'data': {
                'pick_up_address': '123 Main Street',
                'drop_off_address': '456 Piney Road',
                'rider': user.id,
            },
        })

        # Receive JSON message from server on test channel.
        # "test_channel" is defined above in this test
        response = await channel_layer.receive('test_channel')
        response_data = response.get('data')

        # confirm the identity of the rider who sent it
        assert response_data['id'] is not None
        assert response_data['rider']['username'] == user.username
        assert response_data['driver'] is None

        await communicator.disconnect()

    async def test_create_trip_group(self, settings):
        """[summary]
        • When the rider sends a request, we create a Trip record and link them to it.
        • We're missing the piece that associates the correct communication channel 
            with that rider.
        • We need to add two pieces of functionality:
            1) Create a group for the new `Trip` record and add the rider to it.
            2) Add the rider to all of the trip-related groups they they belong
                to when the WebSocket connects and remove them from that group
                when the WebSocket disconnects.
        Args:
            settings ([type]): [description]
        """
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()

        # Send a ride request.
        await communicator.send_json_to({
            'type': 'create.trip',
            'data': {
                'pick_up_address': '123 Main Street',
                'drop_off_address': '456 Piney Road',
                'rider': user.id,
            },
        })
        response = await communicator.receive_json_from()
        response_data = response.get('data')

        # Send a message to the trip group.
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send(response_data['id'], message=message)

        # Rider receives message.
        response = await communicator.receive_json_from()
        assert response == message

        await communicator.disconnect()

    async def test_join_trip_group_on_connect(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        trip = await create_trip(rider=user)
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()

        # Send a message to the trip group.
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f'{trip.id}', message=message)

        # Rider receives message.
        response = await communicator.receive_json_from()
        assert response == message

        await communicator.disconnect()

    async def test_driver_can_update_trip(self, settings):
        """
        • we create a rider and a trip and then we start 
            listening on the communication channel associated with the trip
        •
        """
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS

        # Create trip request.
        rider, _ = await create_user(
            'test.rider@example.com', 'pAssw0rd', 'rider'
        )
        trip = await create_trip(rider=rider)
        trip_id = f'{trip.id}'

        # Listen for messages as rider.
        channel_layer = get_channel_layer()
        await channel_layer.group_add(
            group=trip_id,
            channel='test_channel'
        )

        # Update trip.
        # creating a driver
        driver, access = await create_user(
            'test.driver@example.com', 'pAssw0rd', 'driver'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()
        # calling the update_trip function to handle this webSocket request.
        message = {
            'type': 'update.trip',
            'data': {
                'id': trip_id,
                'pick_up_address': trip.pick_up_address,
                'drop_off_address': trip.drop_off_address,
                'status': Trip.IN_PROGRESS,
                'driver': driver.id,
            },
        }
        await communicator.send_json_to(message)

        # Rider receives message.
        response = await channel_layer.receive('test_channel')
        response_data = response.get('data')
        assert response_data['id'] == trip_id
        assert response_data['rider']['username'] == rider.username
        assert response_data['driver']['username'] == driver.username

        await communicator.disconnect()

    async def test_driver_join_trip_group_on_connect(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'driver'
        )
        trip = await create_trip(driver=user)
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/taxi/?token={access}'
        )
        connected, _ = await communicator.connect()

        # Send a message to the trip group.
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f'{trip.id}', message=message)

        # Rider receives message.
        response = await communicator.receive_json_from()
        assert response == message

        await communicator.disconnect()
