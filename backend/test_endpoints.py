import urllib.request, json, urllib.error
base_url = 'http://localhost:8000/api'

def test_get(path, headers={}):
    req = urllib.request.Request(base_url + path, headers=headers)
    try:
        return urllib.request.urlopen(req).status
    except urllib.error.HTTPError as e:
        print(f"Error on {path}:", e.read().decode('utf-8'))
        return e.code
    except Exception as e:
        return str(e)

print('/zones/ ->', test_get('/zones/'))
print('/recommendation/ ->', test_get('/recommendation/'))

# Login to get token for protected routes
login_data = json.dumps({'email':'manager@vit.edu','password':'testpass123'}).encode('utf-8')
req = urllib.request.Request(base_url + '/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
token = json.loads(resp.read().decode('utf-8'))['access_token']
headers = {'Authorization': f'Bearer {token}'}

print('/auth/me ->', test_get('/auth/me', headers))
print('/logs/ ->', test_get('/logs/', headers))
print('/logs/analytics ->', test_get('/logs/analytics', headers))
print('/vehicles/misparked ->', test_get('/vehicles/misparked', headers))
