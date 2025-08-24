<template>
  <div id="PictureManagePage">
    <!-- 表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch" style="margin-bottom: 16px">
      <a-form-item label="图片id">
        <a-input v-model:value="searchParams.id" placeholder="请输入图片id" />
      </a-form-item>
      <a-form-item label="关键词">
        <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" />
      </a-form-item>
      <a-form-item label="用户id">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户id" />
      </a-form-item>
      <a-form-item label="类型">
        <a-auto-complete v-model:value="searchParams.category" placeholder="请输入图片类型" style="min-width: 180px" :options="categoryOptions"/>
      </a-form-item>
      <a-form-item label="标签">
        <a-select mode="tags" v-model:value="searchParams.tags" placeholder="请输入图片标签" style="min-width: 180px" :options="tagOptions"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>


    <!-- 表格 -->
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange" :scroll="{ y: 630 }">
      <template #bodyCell="{ column, text , record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="70" :height="70"></a-image>
        </template>
        <template v-if="column.dataIndex === 'tags'">
          <a-select v-if="editableData[record.id]" v-model:value="editableData[record.id][column.dataIndex]" mode="tags" style="min-width: 180px" :options="tagOptions"/>
          <template v-else>
            <a-tag style="margin: 5px;" color="blue" v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
          </template>
        </template>
        <template v-if="column.dataIndex === 'category'">
          <div>
            <a-auto-complete v-if="editableData[record.id]" v-model:value="editableData[record.id][column.dataIndex]" style="min-width: 100px;margin: -5px 0;" :options="categoryOptions"/>
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式: {{ record.picFormat }}</div>
          <div>宽度: {{ record.picWidth }}</div>
          <div>高度: {{ record.picHeight }}</div>
          <div>宽高比: {{ record.picScale }}</div>
          <div>大小: {{ (record.picSize / 1024).toFixed(2) }}</div>
        </template>

        <template v-if="['name', 'introduction'].includes(column.dataIndex)">
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
        <template v-if="column.dataIndex === 'editTime'">
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
import { computed, createVNode, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  updatePictureUsingPost,
  listPictureTagCategoryUsingGet
} from '@/service/api/PictureController.ts'
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
    title: '图片',
    dataIndex: 'url',
    align: 'center'
  },
  {
    title: '名称',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '类型',
    dataIndex: 'category',
    align: 'center',
  },
  {
    title: '标签',
    dataIndex: 'tags',
    align: 'center'
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    align: 'center'
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    align: 'center',
    width: '180px'
  },{
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center'
  },{
    title: '编辑时间',
    dataIndex: 'editTime',
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
const dataList = ref<API.Picture[]>([]);
const total = ref<number>(0);

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>(
  {
    current: 1,
    pageSize: 6,
    sortField: 'createTime',
    sortOrder: 'descend'
  }
);
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
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
  getTagCategoryOptions();
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
    pageSizeOptions: ['6', '12', '18'],
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
const editableData: UnwrapRef<Record<string, API.Picture[]>> = reactive({});
const doEdit = (id: string) => {
  editableData[id] = JSON.parse(JSON.stringify(dataList.value.filter(item => id === item.id?.toString())[0]));
  if(editableData[id]["tags"]){
    editableData[id]["tags"] = JSON.parse(editableData[id]["tags"]);
  }
};
const doEditSave = async (id: string) => {
  // Object.assign(dataList.value.filter(item => id === item.id?.toString())[0], editableData[id]);
  const res = await updatePictureUsingPost( editableData[id] );
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
    content: '你确定要删除该图片吗?',
    onOk: async () => {
      const res = await deletePictureUsingPost({ id });
      if(res.data.code === 0){
        message.success("删除成功");
        await fetchData();
      }else{
        message.error("删除失败:" + res.data.message);
      }
    }
  })

}


const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])
/**
 * 提交表单
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  //操作成功
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        name: data,
        value: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        name: data,
        value: data,
      }
    })
  } else {
    message.error('获取失败,' + res.data.message)
  }
}


</script>
<style scoped>

.editable-row-operations button {
  margin-right: 8px;
}
</style>
