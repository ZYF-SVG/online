<template>
<!-- 角色列表 -->
  <div class="roles-conent">

    <!-- 面板屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 按鈕 -->
      <el-button type="primary" @click="appear">添加角色</el-button>

      <!-- 表格 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展開列 -->
        <el-table-column type="expand">
          <!-- 使用作用域插槽获取每列的数据 -->
          <template v-slot:default="slotProps">
            <!-- <pre>{{ slotProps.row }}</pre> -->
            <!-- 权限的等级，放在 栅格系统中，一级占 5 列，二三占 19 列 -->
            <el-row v-for="(item1, i1) in slotProps.row.children" :key="item1.id"  :class="['bbottom', i1 === 0 ? 'btop' : '', 'flexcenter']">
              <!-- 一级 -->
              <el-col :span="5">
                <el-tag closable @close="removeTagInfo(slotProps.row, item1.id)"> 
                  {{ item1.authName }} 
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级 -->
              <el-col :span="19">
                <!-- 要设置top边框，因为i为 0，是一定有的，如果设置 bottom 最后的 i 是没有固定值的 -->
                <el-row  v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'btop', 'flexcenter']">
                   <!-- 二级 -->
                   <el-col :span="5">
                     <el-tag type="success" closable @close="removeTagInfo(slotProps.row, item2.id)">{{ item2.authName }}</el-tag>
                     <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="19">
                    <el-tag @close="removeTagInfo(slotProps.row, item3.id)" closable type="warning"  v-for="item3 in item2.children" :key="item3.id">
                      {{ item3.authName }} 
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>  
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名稱" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="slotProps">
            <!-- <pre>{{ slotProps.row }}</pre> -->
            <el-button type="primary" size="min" plain icon="el-icon-edit" @click="getRolesInfo(slotProps.row.id)">修改</el-button>
            <el-button type="danger" size="min" plain icon="el-icon-delete" @click="removeRolesInfo(slotProps.row.id)">刪除</el-button>
            <el-button type="warning" size="min" plain icon="el-icon-setting" @click="showSetRightDialog(slotProps.row)">修改權限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加對話框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" @close="addClearRolesForm" width="30%">
      <!-- 表單 -->
      <el-form ref="addRolesFormRef" :rules="rolesRules" :model="addRoles" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog title="修改角色" :visible.sync="getRolesDialogVisible" @close="modifyClearRolesForm" width="30%">
      <!-- 表單 -->
      <el-form ref="modifyRolesFormRef" :rules="rolesRules" :model="getList" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="getList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="getList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="getRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="updateRolesDialogVisible" width="50%">
      <!-- 所有权限列表  props 加载规则-->
      <el-tree :data="rightList" :props="treeProps" node-key="id" 
      show-checkbox default-expand-all :default-checked-keys="defkey" ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updatePermissions">确 定</el-button>
      </span>
    </el-dialog>

  </div>
  <!-- 235 -->
</template>

<script>
export default {
  data() {
    return {
      // 獲取角色列表
      rolesList: [],
      // 存儲 添加角色 對話框狀態
      addRolesDialogVisible: false,
      // 和添加角色，進行雙向數據綁定
      addRoles: {
        roleName: '',    // 角色名称
        roleDesc: ''     // 角色描述
      },
      // 添加对话框 的验证规则
      rolesRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色的描述', trigger: 'blur' }
        ]
      },
      // 修改角色 对话框的状态
      getRolesDialogVisible: false,
      // 存储修改对话框查取的数据
      getList: {},
      // 修改权限 对话框的状态
      updateRolesDialogVisible: false,
      // 存储所有权限的列表
      rightList: [],
      // tree 控件的属性
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 存储每个 角色权限 id
      defkey: [],
      // 存储当前点击修改权限按钮的id
      idStr: ''
    }
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 發起角色列表請求
    async getRolesList() {
      const { data : res } = await  this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('獲取角色列表失敗');
      }
      this.rolesList = res.data;
    },
    // 點擊 添加角色 按鈕觸發
    appear() {
      // 顯示對話框
      this.addRolesDialogVisible = true;
    },
    // 重置添加表單
    addClearRolesForm() {
      this.$refs.addRolesFormRef.resetFields();
    },
    // 發起 添加角色 請求
    addRolesInfo() {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单内容不合法！');
        }

        const { data : res } = await this.$http.post('roles', this.addRoles);
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失敗');
        }
        this.$message.success('添加角色成功');
        this.addRolesDialogVisible = false;
        this.getRolesList();
      })

    },
    // 点击修改按钮 触发
    async getRolesInfo(id) {
      // 打开对话框
      this.getRolesDialogVisible = true;
      // 获取数据
      const { data : res } = await this.$http.get('roles/' + id);
        this.getList = res.data;
    },
    // 重置修改按钮
    modifyClearRolesForm() {
      this.$refs.modifyRolesFormRef.resetFields();
    },
    // 点击确定按钮，提交编辑用户
    modifyRolesInfo() {
      // 进行修改的预验证
      this.$refs.modifyRolesFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单内容不合法');
        }

        const { data : res } = await this.$http.put('roles/' + this.getList.roleId, {
          roleName: this.getList.roleName,
          roleDesc: this.getList.roleDesc
        })

        if (res.meta.status !== 200) {
          return this.$message.error('修改用户失败');
        }

        this.getRolesList();
        this.$message.success('修改用户成功');
        this.getRolesDialogVisible = false;
      })
    },
    // 点击删除按钮
    async removeRolesInfo(id) {
      const { data : res } = await this.$http.delete('roles/' + id);
    
      if (res.meta.status !== 200) {
        return  this.$message.error('删除用户失败!');
      }

      this.getRolesList();
      this.$message.success('删除用户成功');
    },
    // 点击图标，删除权限
    async removeTagInfo(roles, rights) {
      const data = await this.$confirm('是否删除角色的权限!','删除权限', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err;
      })  // cancel 取消   confirm 确定
      
      if ( data !== 'confirm') {   // 取消 
        return this.$message.info('取消删除成功!');
      }

      const { data : res } = await this.$http.delete('roles/'+ roles.id + '/rights/' + rights);
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败');
      }

      this.$message.success('删除权限成功');
      roles.children = res.data;
      // this.getRolesList();  不是从新加载页面，而是把删除后的返回数据，赋值给 当前的 角色， data 里是最新的 权限
      // 就不会造成表单的 关闭；
    },
    // 点击出现 分配权限 对话框
    async  showSetRightDialog(itemcon) {
      // 获取 所有权限的列表
      const { data : res } = await this.$http.get('rights/tree');
      this.rightList = res.data;

      // 循环到第三场权限，拿到第三级权限的 id, 所用 forEach 是 数组用的
      this.fordate(itemcon, this.defkey);

      // 存储当前点击修改权限的 id
      this.idStr = itemcon.id;
      this.updateRolesDialogVisible = true;
    },
    // 循环，点前点击 修改权限 的角色，获取他们的第三级 权限的id
    fordate(node, arr) {
      if (!node.children) {   // 没有 children 属性时, 就为第三级
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        // console.log(item);
        this.fordate(item, arr);
      })
    },
    // 点击确定 发起 修改角色权限
    async updatePermissions() {
      // 当前勾选的权限的id, 使用 展开运算符 合并数组
      const keys = [
        ...this.$refs.treeRef.getHalfCheckedKeys(), 
        ...this.$refs.treeRef.getCheckedKeys()
        ];
      // 在转换为字符串
      const keyStr = keys.join(',');
      const { data : res } = await this.$http.post('roles/'+ this.idStr +'/rights', { rids: keyStr })

      if (res.meta.status !== 200) {
        return this.$message.error('修改权限失败');
      }

      this.$message.success('修改权限成功');
      this.updateRolesDialogVisible = false;
      this.getRolesList();
    }
  }
}
</script>

<style lang="less" scoped>
  .roles-conent {
    // 设置一级标签的上下边框 和 距离
    .el-tag {
      margin: 15px;
    }
    .btop {
      border-top: 1px solid #eee;
    }
    .bbottom {
      border-bottom: 1px solid #eee;
    }
    .flexcenter {
      display: flex;
      align-items: center;
    }
  }
</style>