<template>
    <el-container>
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <!-- <template v-for="category in categories">
          <q-list-header>
            {{ category.title }}
          </q-list-header>
          <q-side-link
            item
            v-for="feature in category.features"
            :key="feature.hash"
            :to="`/${category.hash}/${feature.hash}`"
            replace
          >
            <q-item-side :icon="feature.icon" />
            <q-item-main :label="feature.title" />
            <q-item-side right icon="chevron_right" />
          </q-side-link>
          <q-item-separator />
        </template> -->
        <el-menu :router="true" :default-openeds="['0','1','2','3']">
          <el-submenu :index="''+index" v-for="(category,index) in categories" :key="category.title">
            <template slot="title">
              <i class="material-icons">{{ category.icon }}</i>
              {{ category.title }}
            </template>
            <template v-for="feature in category.features">
              <el-menu-item :index="`/${category.hash}/${feature.hash}`" @click="itemClick(feature)">
                <i class="material-icons">{{ feature.icon }}</i>
                {{ feature.title }}
            </el-menu-item>
            </template>
          </el-submenu>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <h2>{{title}}</h2>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>
<style>
  .el-aside {
    color: #333;
  }
</style>

<script>
import store from '../main-store'
import categories from '../categories'
import pjson from '../../../package.json'

export default {
  data () {
    return {
      title: '首页',
      pjson: pjson,
      categories,
      store: store.state
    }
  },
  methods: {
    handleSelect (key, keyPath) {
      console.log(key, keyPath)
    },
    itemClick (feature) {
      this.title = feature.title
      console.log(feature.title)
    }
  }
}
</script>