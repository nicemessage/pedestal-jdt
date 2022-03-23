// import axios from 'axios';

// const loadConfig = async () => {
//   let configUrl = '/portal.json';
//   if (process.env.NODE_ENV === 'true') {
//     configUrl = '/web-config/portal.json';
//   }
//   const res = await axios.get(configUrl);
//   const config = res.data;

//   // store.commit('app/SET_ENV_CONFIG', config);
//   window.BASE_UAS_LOGIN_URL = config.BASE_UAS_LOGIN_URL;
//   window.BASE_UAS_LOGOUT_URL = config.BASE_UAS_LOGOUT_URL;
//   window.GALAXY_BASE_URL = config.GALAXY_BASE_URL;
//   window.DOMAIN = config.DOMAIN;
// };

// loadConfig();
