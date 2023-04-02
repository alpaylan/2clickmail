FROM python:3.10-alpine
RUN mkdir -p /usr/local/app
WORKDIR  /usr/local/app
RUN apk add bash
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install gunicorn
COPY . .
CMD /bin/sh -c "gunicorn --bind 0.0.0.0:5000 wsgi:app"