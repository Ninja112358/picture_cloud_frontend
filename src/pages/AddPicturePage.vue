<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '编辑图片' : '添加图片' }}
    </h2>
    <!--图片上传组件-->
    <PictureUpload :picture="picture" :on-success="onSuccess" />
    <!--图片信息表单-->
    <!-- 表单 -->
    <a-form
      v-if="picture"
      layout="vertical"
      :model="pictureForm"
      @finish="handleSubmit"
      style="margin-bottom: 16px"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          allow-clear
          :options="categoryOptions"
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          mode="tags"
          v-model:value="pictureForm.tags"
          placeholder="请输入标签"
          allow-clear
          :options="tagOptions"
        >
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">
          {{ route.query?.id ? '修改' : '创建' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  listPictureTagCategoryUsingGet,
  getPictureVoByIdUsingGet,
} from '@/service/api/pictureController.ts'
import { useRouter, useRoute } from 'vue-router'

const picture = ref<API.PictureVO>()
const pictureForm = reactive<API.PictureEditRequest>({})
const router = useRouter()

/**
 * 图片上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }
  console.log(values)
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })
  //操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success(route.query?.id ? '编辑成功' : '创建成功')
    //跳转到图片详情
    await router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error(route.query?.id ? '编辑失败,' : '创建失败,' + res.data.message)

  }
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
onMounted(() => {
  getTagCategoryOptions();
  getOldPicture();
})

const route = useRoute()
const getOldPicture = async () => {
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}
</script>
<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
