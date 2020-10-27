from channels.generic.websocket import AsyncJsonWebsocketConsumer


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

    async def connect(self):
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
        else:
            await self.channel_layer.group_add(
                group='test',
                channel=self.channel_name
            )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            group='test',
            channel=self.channel_name
        )
        print("THE DEFAULT VALUE OF argument `code` ", code)
        await super().disconnect(code)

    async def echo_message(self, message):
        await self.send_json({
            'type': message.get('type'),
            'data': message.get('data'),
        })

    async def receive_json(self, content, **kwargs):
        message_type = content.get('type')
        if message_type == 'echo.message':
            await self.send_json({
                'type': message_type,
                'data': content.get('data'),
            })
