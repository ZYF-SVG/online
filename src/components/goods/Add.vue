<template>
  <div cladd="add_content">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 信息提示 -->
       <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>

       <!-- 步骤条 active:步骤条当前选中项, 接收 Number -->
       <el-steps :active="activelIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form :label-position="'top'" :model="addForm" :rules="addRules" ref="addRuleForm" label-width="100px">
        <!-- 标签页 v-model：标签页选中的项，根据 name 来绑定，只接收 string; beforeTabLeave 点击标签页触发，注意是属性绑定-->
        <el-tabs v-model="activelIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
             <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="Number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="Number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="Number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                @change="headleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 每一项参数 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableDate" :key="item.attr_id">
              <!-- 多选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="ba" v-for="(ba, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabeDate" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片组件，action：上传图片的地址，全地址，因为没有使用 axios 进行发送请求的 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="objHeaders"
              :on-success="uploadSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 提交按钮 -->
            <el-button type="primary" class="addBut" @click="addgoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片展示框 -->
    <el-dialog title="图片展示" :visible.sync="previeVisible" width="50%">
      <img :src="previewPath" class="addImg">
    </el-dialog>
  </div>
</template>

<script>
// 引入 拷贝对象方法
import _ from 'lodash';

export default {
  data () {
    return {
      activelIndex: '0',
      // 添加商品表单的数据源
      addForm: {
        goods_name: '',     // 商品名称
        goods_price: 0 ,    // 商品价格
        goods_number: 0 ,   // 商品数量
        goods_weight: 0 ,   // 商品重量
        goods_cat: [],      // 商品分类
        pics: [],           // 图片临时地址
        goods_introduce: '', // 商品介绍
        attrs: []           // 动态参数 和 静态属性
      },
      // 添加表单的验证规则
      addRules: {
        goods_name: [
          { required: true, message: '请输入商品的名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品的价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品的重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品的数量', trigger: 'blur' }
        ],
        goods_cat: [
           { required: true, message: '请输选择商品的分类', trigger: 'blur' }
        ]
      },
      // 存储商品分类列表数据
      cateList: [],
      // 存储 动态参数
      manyTableDate: [],
      // 存储 静态属性
      onlyTabeDate: [],
      // 存储 上传图片的 地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置请求的 token 
      objHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片展示框 显示 与隐藏
      previeVisible: false,
      // 存储展示图片的路径
      previewPath: ''
    }
  },
  created () {
    this.getCateList();
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data : res } = await this.$http.get('categories');

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败');
      }

      this.cateList = res.data;
    },
    // 选中级联选择器后触发的函数
    headleChange () {
      console.log(this.addForm.goods_cat);
    },
    // 点击 tabe标签页触发
    beforeTabLeave(activeName, oldActiveName) {
      // 判断，如果是 0 的话，切换到别的标签页时，要选中商品三级标签
      if (oldActiveName === '0') {
         if (this.addForm.goods_cat.length !== 3) {
           this.$message.error('请选择商品分类');
           return false;
         }
      }
    },
    // 点击 tabs 标签页的选项，触发函数
    async tabClicked() {
      // 判断，如果选中的标签页为1时(商品参数)，就发起请求商品参数的请求
      if (this.activelIndex == 1) {
        const { data : res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel : 'many' }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败');
        }

        // 把数据中的 attr_vals，转换为数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.split(',');
        })

        this.manyTableDate = res.data;

      } else if(this.activelIndex == 2) {  // 2.静态属性
        const { data : res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel : 'only'}
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败');
        }

        this.onlyTabeDate = res.data;
      }
    },
    // 点击删除图片触发
    handleRemove(file, fileList) {
      // 获取删除的图片的临时地址
      let clockImg = file.response.data.tmp_path;
      
      // 循环获取每一项的 临时地址
      for (let item in this.addForm.pics) {
        if (this.addForm.pics[item].pic == clockImg) {
          // 获取 item 索引，删除数组中的元素
          this.addForm.pics.splice(item, 1);
        }
      }
    },
    // 点击图片列表 触发, 浏览图片的
    handlePreview(file) {
      // 图片显示框显示
      this.previeVisible = true;
    },
    // 图片上传成功触发的函数
    uploadSuccess(response, file, fileList) {
      // response 上传的信息； file：图片的信息； fileList：上传图片列表
      // 图片虽然上传到服务器了，但他以后还有进行读取，所以还有把路径给 添加到 上传参数中，一起上传到 添加商品中；
      this.addForm.pics.push({pic: response.data.tmp_path});
      // 获取上传图片的路径
      this.previewPath = response.data.url;
    },
    // 点击添加商品按钮触发函数
    addgoods() {
      // 对表单进行预言证
      this.$refs.addRuleForm.validate( async value => {
        if (value !== true) {
          return this.$message.error('请认真填写好表单');
        }

        // 通过验证, 深拷贝 对象
        let form = _.cloneDeep(this.addForm);
        // 把 goods_cat 转换为字符串
        form.goods_cat = form.goods_cat.join(',');

        // 处理 attrs 数据
        // 动态参数
        this.manyTableDate.forEach(item => {
          const manyTableDate = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          form.attrs.push(manyTableDate);
        })
        // 静态属性
        this.onlyTabeDate.forEach(item => {
          const onlyTabeDate = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          form.attrs.push(onlyTabeDate);
        })
        
        // 发起 添加商品请求
        const { data : res } = await this.$http.post('goods', form);

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败');
        }

        this.$router.push('/goods');
      })


      // 根据 接口api 的参数要求，goods_cat 必须是由 逗号 分隔 的字符串
      // console.log(this.addForm.goods_cat);
      // console.log(this.addForm.goods_cat.join(','));
    }
  },
  // 计算属性
  computed: {
    // 监听 三级商品的 id
    cateId() {
      return this.addForm.goods_cat[2];
    }
  }
}
</script>

<style lang="less" scoped>
  .el-steps {
    margin: 20px 0;
  }
  .el-checkbox {
    margin: 5px 10px;
  }
  // 上传图片的显示
  .addImg {
    width: 100%;
  }
  // 添加按钮
  .addBut {
    margin-top: 20px;
  }
</style>