//AIzaSyAMG9pUPy51Bj_ds5LRGSV3nts_kwNIOlU
const btn = document.createElement('button');
document.body.append(btn);
btn.textContent = 'Test';

function init() {
  gapi.load('auth', async () => {
    const obj = gapi.auth2.init({
      client_id:
        '873414564284-7ai96aecek20c725secg1vetqbp7ftm7.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    });

    obj.then(async () => {
      btn.onclick = async () => {
        const user = await obj.signIn();
        const token = user.getAuthResponse();

        const response = await fetch(
          'https://photoslibrary.googleapis.com/v1/albums',
          {
            headers: {
              Authorization: 'Bearer ' + token.access_token,
            },
          },
        );

        console.log(await response.json());
      };
    });
  });
}

init();
