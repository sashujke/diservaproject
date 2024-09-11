import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setUser, UserState } from '../redux/reducers/userReducer';
import AuthFunc from '../components/Auth';

const CallbackPage: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');
  const CLIENT_ID = '1139259244122751027';
  const CLIENT_SECRET = 'iTKReUgsjYZByI8qyVjUS3LnhAyb9VaO';
  const REDIRECT_URI = 'http://localhost:3000/callback';

  useEffect(() => {
    const fetchData = async () => {
        if (!code) {
          AuthFunc();
          return
        }

        const body = new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            scope: 'identify+guilds'
        }).toString();

        try {
            const response = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            });

            if (!response.ok) {
                AuthFunc();
            }

            const data = await response.json();
            const token = data.access_token
            if (token) {
              const response = await fetch(`http://localhost:4000/api/auth/discord/${token}`, 
                { 
                  method: 'GET', 
                  credentials: 'include'
                }) //backend

              if (!response.ok) {
                AuthFunc()
              }

              const user: UserState = await response.json()
              dispatch(setUser({
                discordId: user.discordId,
                username: user.username,
                avatar: user.avatar,
                status: user.status,
                permission: user.permission,
                globalName: user.globalName,
                locale: user.locale,
                isAuth: true
              }));

              navigate('/')
            }
        } catch (error) {
            console.log(error)
        }
    };
    fetchData();
  }, [code])

  return (
    <div>
    </div>
  );
}

export default CallbackPage;