<template>
  <div id="userManagePage">
    <!-- 表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch" style="margin-bottom: 16px">
      <a-form-item label="用户id">
        <a-input v-model:value="searchParams.id" placeholder="请输入用户id" />
      </a-form-item>
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item label="用户简介">
        <a-input v-model:value="searchParams.userProfile" placeholder="请输入用户简介" />
      </a-form-item>
      <a-form-item label="用户角色">
        <a-select
          ref="select"
          v-model:value="searchParams.userRole"
          style="width: 100px"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option value="user">用户</a-select-option>
          <a-select-option value="admin">管理员</a-select-option>
          <a-select-option value="fuck">未知</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>


    <!-- 表格 -->
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange" :scroll="{ y: 630 }">
      <template #bodyCell="{ column, text , record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="70" :height="70"></a-image>
        </template>
        <template v-if="column.dataIndex === 'userRole'">
          <div>
            <template v-if="editableData[record.id]">
              <a-select
                ref="select"
                v-model:value="editableData[record.id][column.dataIndex]"
                style="width: 100px"
              >
                <a-select-option value="user">用户</a-select-option>
                <a-select-option value="admin">管理员</a-select-option>
              </a-select>
            </template>
            <template v-else>
              <div v-if="record.userRole === 'admin'">
                <a-tag color="gold">管理员</a-tag>
              </div>
              <div v-else-if="record.userRole === 'user'">
                <a-tag color="blue">用户</a-tag>
              </div>
              <div v-else>
                <a-tag color="gray">未知</a-tag>
              </div>
            </template>
          </div>
        </template>

        <template v-if="['userAccount', 'userName', 'userProfile'].includes(column.dataIndex)">
          <div>
            <a-input
              v-if="editableData[record.id]"
              v-model:value="editableData[record.id][column.dataIndex]"
              style="margin: -5px 0"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <div class="editable-row-operations">
            <span v-if="editableData[record.id]">
              <a-button @click="doEditCancel(record.id)">取消</a-button>
              <a-button type="primary" @click="doEditSave(record.id)">保存</a-button>
            </span>
            <span v-else>
              <a-button type="primary" @click="doEdit(record.id)">编辑</a-button>
              <a-button type="primary" danger @click="doDelete(record.id)">删除</a-button>
            </span>

          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { DownOutlined } from '@ant-design/icons-vue';
import { computed, createVNode, onMounted, reactive, ref } from 'vue'
import {
  deleteUserUsingPost,
  listUserVoByPageUsingPost,
  updateUserUsingPost
} from '@/service/api/userController.ts'
import { message, Modal } from 'ant-design-vue'
import type { UnwrapRef } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
    width: '180px'
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    align: 'center'
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    align: 'center'
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    align: 'center'
  },
  {
    title: '用户简介',
    dataIndex: 'userProfile',
    align: 'center',
    width: '400px',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    align: 'center'
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: '200px',
  },
]

//定义数据
const dataList = ref<API.UserVO[]>([]);
const total = ref<number>(0);

//搜索条件
const searchParams = reactive<API.UserQueryRequest>(
  {
    current: 1,
    pageSize: 6,
    userRole: 'all',
    sortField: 'createTime',
    sortOrder: 'ascend'
  }
);
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams
  });
  if(res.data.code === 0 && res.data.data){
    dataList.value = res.data.data.records ?? [];
    total.value = res.data.data.total ?? 0;
  }else{
    message.error("数据获取失败:" + res.data.message);
  }
}
//页面加载时获取数据,请求一次
onMounted(()=>{
  fetchData();
})

//分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: Number(total.value),
    showSizeChanger: true,
    showQuickJumper:true,
    position: ['bottomCenter'],
    pageSizeOptions: ['6', '12', '18','24'],
    showTotal: (total : string) => `共 ${total} 条`,
  }
});
// 表格分页变化之后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current;
  searchParams.pageSize = page.pageSize;
  fetchData();
}
// 搜索点击事件
const doSearch = () => {
  searchParams.current = 1;
  fetchData();
}
// 编辑功能
const editableData: UnwrapRef<Record<string, API.UserVO[]>> = reactive({});
const doEdit = (id: string) => {
  editableData[id] = JSON.parse(JSON.stringify(dataList.value.filter(item => id === item.id?.toString())[0]));
};
const doEditSave = async (id: string) => {
  // Object.assign(dataList.value.filter(item => id === item.id?.toString())[0], editableData[id]);
  const res = await updateUserUsingPost( editableData[id] );
  if(res.data.code === 0){
    message.success("编辑成功");
    await fetchData();
  }else{
    message.error("编辑失败:" + res.data.message);
  }
  delete editableData[id];
};
const doEditCancel = (id: string) => {
  delete editableData[id];
};
const doDelete = async (id: string) => {
  if(!id){
    message.error("删除失败:id不存在");
    return;
  }
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '你确定要删除该用户吗?',
    onOk: async () => {
      const res = await deleteUserUsingPost({ id });
      if(res.data.code === 0){
        message.success("删除成功");
        await fetchData();
      }else{
        message.error("删除失败:" + res.data.message);
      }
    }
  })

}


</script>
<style scoped>

.editable-row-operations button {
  margin-right: 8px;
}
</style>
