# 每周总结可以写在这里

# 浏览器工作原理

## 请求体

```
POST / HTTP/1.1 ---- Request line
Host: 127.0.0.1 ---- Headers
Content-Type: application/x-www-form-urlencoded ---- Headers
\r
field1=aaa&code=x%3D1 ---- Body
```

## 响应体

```
HTTP/1.1 200 OK ---- Status line
Content-Type: application/x-www-form-urlencoded ---- Headers
Date: Wed, 13 May 2020 15:32:04 GMT ---- Headers
Connection: keep-alive ---- Headers
Transfer-Encoding: chunked ---- Headers
\r
999 ---- Body
<...> ---- Body
...
22 ---- Body
<span>excellent</span> ---- Body
...
0
```
