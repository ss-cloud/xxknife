<template>
  <div>
    <div>
      <el-button type="primary" :loading="geted" @click="get">获取代理</el-button>
      <el-button type="success" :loading="checked" @click="check">验证代理</el-button>
    </div>
    <div style="margin-top:40px;">
      代理数量：{{ count }}
    </div>

    <div style="margin-top:40px;">
      有效代理数量：{{ valid_count }}
    </div>

    <div style="margin-top40px;">
      <el-table
        :data="validList"
        style="width: 100%">
        <el-table-column
          prop="ip"
          label="IP"
          width="180">
        </el-table-column>
        <el-table-column
          prop="port"
          label="端口"
          width="180">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
const {ipcRenderer} = require('electron')

ipcRenderer.on('check-proxy-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})

export default {
  data () {
    return {
      geted: false,
      checked: false,
      count: 0,
      valid_count: 0,
      proxyList: [],
      validList: []
    }
  },
  created: function () {
    var vm = this
    ipcRenderer.on('get-proxy-reply:finish', (event, proxyList) => {
      vm.geted = false
      vm.proxyList = proxyList
    })

    ipcRenderer.on('get-proxy-reply:attr', (event, attr) => {
      vm.count = attr.count
    })

    ipcRenderer.on('check-proxy-reply:finish', (event, proxyList) => {
      vm.checked = false
      vm.proxyList = proxyList
    })

    ipcRenderer.on('check-proxy-reply:one', (event, proxy) => {
      vm.validList.push(proxy)
    })
  },
  methods: {
    get () {
      this.geted = true
      ipcRenderer.send('get-proxy')
    },
    check () {
      if (this.proxyList.length === 0) {
        this.$message({
          message: '请先获取IP',
          type: 'warning'
        })
        return
      }
      this.checked = true
      ipcRenderer.send('check-proxy', this.proxyList)
    }
  }
}
</script>