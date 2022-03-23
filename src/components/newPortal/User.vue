<template>
    <div class="pedestal-user-account">
        <el-dropdown
          @command="handleCommand"
          trigger="hover">
            <div class="pedestal-el-dropdown-link">
                <div class="pedestal-right_bar"></div>
                <div class="pedestal-avatar-wrap">
                  <img :src="userIcon" alt="用户头像" class="pedestal-avatar">
                </div>
                <span class="pedestal-user-name" v-if="userInfo.nick">{{ userInfo.nick }} </span>
                <img :src="triangle" alt="下拉箭头" class="pedestal-triangle">
            </div>
            <el-dropdown-menu slot="dropdown" class="user-info-dropdown">
              <el-dropdown-item
               command="changePassword"
               v-if="!isJdcreditpaypd"
              >更改密码</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>

        <el-dialog
          title="修改密码"
          width="640px"
          append-to-body
          :before-close="handleClose"
          :lock-scroll="false"
          :close-on-click-modal="false"
          :visible="dialogVisible"
          v-if="dialogVisible"
        >
        <el-form ref="form" :model="form" label-width="80px" :rules="rules">
          <el-form-item label="原密码" prop="password">
            <el-input v-model="form.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="form.newPassword" type="password"></el-input>
          </el-form-item>
          <el-form-item label="再次确认" prop="newPasswordAgain">
            <el-input v-model="form.newPasswordAgain" type="password"></el-input>
          </el-form-item>
        </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleChangePass">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import userIcon from './user-default.png';
import triangle from './Triangle@1x.png';
import http from '../../util/http';

export default {
  name: 'User',
  created(){
    this.isJdcreditpaypd = window.location.host.indexOf('jdcreditpaypd') > -1;
  },
  data() {
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      isJdcreditpaypd: false,
      userIcon,
      triangle,
      dialogVisible: false,
      form: {
        password: '',
        newPassword: '',
        newPasswordAgain: '',
      },
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
        newPasswordAgain: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' },
        ],
      },
    };
  },

  computed: {
    ...mapGetters([
      'userInfo',
    ]),
  },
  methods: {
    logout() {
      http.post('/api/user/logout').then((res) => {
        console.log(res);
      });
    },
    changePassword() {
      console.log(this.userInfo);
      this.dialogVisible = true;
    },
    handleCommand(handleFn) {
      this[handleFn]();
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleChangePass() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$http.post('/api/user/save', {
            id: this.userInfo.userId,
            insert: false,
            password: this.form.password,
            newPassword: this.form.newPassword,
          }).then((res) => {
            if (res.result === '1') {
              this.$message({
                showClose: true,
                message: '更改成功',
                type: 'success',
              });
              setTimeout(() => {
                // window.eventCenter.emit('SYSTEM_LOGOUT');
              }, 1000);
            } else {
              this.$message({
                showClose: true,
                message: res.rspMsg,
                type: 'error',
              });
            }
            // window.location.href = window.BASE_UAS_LOGOUT_URL + window.location.href;
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
    .pedestal-user-account{
        cursor: pointer;
        display: inline-block;
        .pedestal-el-dropdown-link{
           display: flex;
           align-items: center;
           justify-content: flex-start;
           height: 60px;
           box-sizing: border-box;
           .pedestal-right_bar{
             width:2px;
             height: 12px;
             background: rgba(96,96,96,1);
             margin:0 20px 0 10px;
           }
            .pedestal-avatar-wrap{
              border: 2px solid rgba(0,0,0,0.2);
              margin-right: 10px;
            }
           .pedestal-avatar{
              border-radius: 50%;
              height: 28px;
              width: 28px;
              position: relative;
              
            }
           .pedestal-user-name{
             font-size: 12px;
             display: inline-block;
             color: rgba(255,255,255,1);
           }
          .pedestal-triangle{
            width:8px;
            height:6px;
            margin:0 30px 0 8px;
          }
        }
    }
</style>
