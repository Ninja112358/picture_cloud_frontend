<template>
  <div id="homePage">
    <!--搜索框-->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="请输入搜索内容"
        enter-button="搜索"
        size="medium"
        @search="doSearch"
      />
    </div>
    <!--分类和标签筛选-->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane tab="全部" key="all"/>
      <a-tab-pane v-for="category in categoryList" :tab="category" :key="category"/>
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!--图片列表-->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.url"
                style="height: 180px; object-fit: contain"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag color="blue" v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost
} from '@/service/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

//定义数据
const dataList = ref<API.PictureVO>([])
const total = ref<number>(0)
const loading = ref(true)

const categoryList = ref<string[]>([]);
const selectedCategory = ref<string>('all');
const tagList = ref<string[]>([]);
const selectedTagList = ref<string>([]);

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const fetchData = async () => {
  loading.value = true;
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags:[]
  }
  if(selectedCategory.value !== 'all')
    params.category = selectedCategory.value;
  selectedTagList.value.forEach((useTag, index) => {
    if(useTag)
      params.tags.push(tagList.value[index]);
  });

  const res = await listPictureVoByPageUsingPost(params);
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('数据获取失败:' + res.data.message)
  }
  loading.value = false
}
//页面加载时获取数据,请求一次
onMounted(() => {
  fetchData()
})

//分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: Number(total.value),
    onChange: (page: number, pageSize: number) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

/**
 * 提交表单
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  //操作成功
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? [];
    categoryList.value = res.data.data.categoryList ?? [];
  } else {
    message.error('获取失败,' + res.data.message)
  }
}

const router = useRouter();

const doClickPicture = (picture: API.PictureVO) => {
  //跳转到详情页面
  router.push({
    path: `/picture/${picture.id}`,
  })
}


onMounted(() => {
  getTagCategoryOptions();
})
</script>
<style scoped>
#homePage {
  margin-bottom: 16px;
}
#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}
#homePage .tag-bar {
  margin-bottom: 16px;
}
</style>
