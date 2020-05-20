import Vue from 'vue';

// Message 导入弹框提示
import { Button, Form, FormItem, Input, Message } from 'element-ui';

Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.prototype.$message = Message;   // 全局配置 弹框提示，就可以用 this.$message 来使用弹框提示了。
