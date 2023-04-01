
from flask_login import UserMixin
from urllib.parse import quote

class User(UserMixin):
    def __init__(self, id, email, password):
        self.id = id
        self.email = email
        self.password = password


class Email:
    def __init__(self, to: list[str], cc: list[str], bcc: list[str], subject: str, body: str):

        if (to is None or to == []) or (subject is None or subject == '') or (body is None or body == ''):
            raise ValueError('Recipient list, subject, and body are required')

        self.to = to
        self.subject = subject
        self.body = body
        self.cc = cc
        self.bcc = bcc


class AnonEmail(Email):
    def __init__(self, to: list[str], cc: list[str], bcc: list[str], subject: str, body: str, id: str):
        super().__init__(to, cc, bcc, subject, body)
        self.id = id


class UserEmail(Email):
    def __init__(self, to: list[str], cc: list[str], bcc: list[str], subject: str, body: str, user_id: str, id: str, access: str = 'public'):
        super().__init__(to, cc, bcc, subject, body)
        self.user_id = user_id
        self.id = id
        self.access = access
