FROM python:3.7
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 4000
CMD ["gunicorn", "-w", "4", "-b", ":4000", "main:app"]