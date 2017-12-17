<template>
  <div>
    <div>
      <el-button type="primary" :loading="geted" @click="get">获取代理</el-button>
      <el-button type="success" :loading="checked" @click="check">验证代理</el-button>
      <el-button type="warning" :disabled="!checked" @click="abort">结束验证</el-button>
    </div>
    <div style="margin-top:40px;">
      代理数量：{{ count }}
    </div>

    <div style="margin-top:40px;">
      有效代理数量：{{ valid_count }}
    </div>

    <div style="margin-top40px;">
      <el-pagination
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <el-table
        :data="showValidList"
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
          prop="country"
          label="城市">
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="验证代理有效性" :visible.sync="dialogCheckVisible">
      <el-form :model="form">
        <el-form-item label="验证地址" label-width="120px">
          <el-input v-model="form.url" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCheckVisible = false">取 消</el-button>
        <el-button type="primary" @click="check">确 定</el-button>
      </div>
    </el-dialog>
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
      currentPage: 1,
      pageSize: 20,
      total: 0,
      proxyList: [],
      // check
      dialogCheckVisible: false,
      form: {
        url: 'https://httpbin.org/get?show_env=1'
      },
      validList: [],
      showValidList: []
    }
  },
  created: function () {
    var vm = this
    ipcRenderer.send('check-proxy-abort')
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
      vm.valid_count++
    })
  },
  methods: {
    get () {
      this.geted = true
      ipcRenderer.send('get-proxy')
    },
    showCheckDialog () {
      this.dialogCheckVisible = true
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
      this.valid_count = 0
      this.showValidList = []
      this.validList = []
      ipcRenderer.send('check-proxy-abort')
      ipcRenderer.send('check-proxy', this.proxyList)
    },
    abort () {
      ipcRenderer.send('check-proxy-abort')
      this.showValidList = this.validList.slice(0, this.pageSize)
      this.checked = false
      this.total = this.valid_count
    },
    sizeChange (pageSize) {
      this.pageSize = pageSize
      var start = (this.currentPage - 1) * pageSize
      var end = this.currentPage * pageSize
      this.showValidList = this.validList.slice(start, end)
    },
    currentChange (currentPage) {
      this.currentPage = currentPage
      var start = (currentPage - 1) * this.pageSize
      var end = currentPage * this.pageSize
      this.showValidList = this.validList.slice(start, end)
    }
  }
}
</script>