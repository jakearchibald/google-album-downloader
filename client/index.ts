const clientID =
  '873414564284-7inc7m2lvncd50d79orje366hrl91mnj.apps.googleusercontent.com';
const challengeKey = 'last-code-challenge';
const btn = document.createElement('button');
document.body.append(btn);
btn.textContent = 'Test';

function createCodeVerifier(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(
    { length: 128 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

btn.onclick = () => {
  const codeChallenge = createCodeVerifier();
  sessionStorage.setItem(challengeKey, codeChallenge);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientID,
    redirect_uri: location.origin + '/',
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    code_challenge: codeChallenge,
  }).toString();
  location.href = url.href;
};

async function authUser(code: string) {
  const body = new URLSearchParams({
    code,
    client_id: clientID,
    redirect_uri: location.origin + '/',
    grant_type: 'authorization_code',
    code_verifier: sessionStorage.getItem(challengeKey)!,
  });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body,
  });
  const data = await response.json();

  console.log(data);

  const apiResponse = await fetch(
    'https://photoslibrary.googleapis.com/v1/albums',
    {
      headers: {
        Authorization: 'Bearer ' + data.access_token,
      },
    },
  );

  console.log(await apiResponse.json());
}

const url = new URL(location.href);
const code = url.searchParams.get('code');
if (code) authUser(code);
