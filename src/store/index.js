import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {}
  },
  getters: {
    userInfo: state => state.userInfo
  },
  mutations: {
    updateUserInfo(state, data){
      state.userInfo = data
    }
  },
  actions: {
  },
  modules: {
  }
})
