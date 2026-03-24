from locust import HttpUser, task, between

class URLShortenerUser(HttpUser):
    host = "http://127.0.0.1:8000"
    wait_time = between(0.1, 0.5)

    @task
    def redirect_test(self):
        self.client.get("/cnr5hg", allow_redirects=False)