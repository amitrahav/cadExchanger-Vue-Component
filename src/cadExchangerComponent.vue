<template>
    <iframe v-if="file_id && status_ready" :width="width?width:''" :height="height?height:''" 
    :src="`https://cloud.cadexchanger.com/embedded.html?fileId=${file_id}&cameraType=${cameraType?cameraType:'isometric'}&displayMode=${displayMode?displayMode:'auto'}&autoPlay=${autoPlay?1:0}&showViewCube=${showViewCube?1:0}&representation=${representation?representation:'auto'}`" 
    :frameborder="`${frameborder?frameborder:0}`">
    </iframe>
</template>

<script>
  import axios from 'axios'
  
  export default {
    name: 'cadExchanger',
    props: {
      file_url: String,
      file_name: String,
      width: Number,
      height: Number,
      autoPlay: Boolean,
      showViewCube: Boolean,
      cameraType: String,
      displayMode: String,
      representation: String,
      frameborder: Number,
      keys_storage: String
    },

    mounted () {
      if(!this.token){
        const {client_id, client_secret, parentFolder} = this.getApiKeys();
        this.parentFolder = parentFolder;
        // Encode api keys to recive token 
        const encodedKeys = Buffer.from(`${client_id}:${client_secret}`).toString('base64');  
        this.authorize(encodedKeys).then(token => this.token = token)
      }
    },

    data: function () {
      return {
        baseUrl: 'https://cloud.cadexchanger.com/api/v1',
        file_id: null,
        token: null,  
        parentFolder: null,
        status_ready: false,
        revisionId: null
      }
    },
    methods: {
      getApiKeys: function(){
        let client_id = null,
            client_secret = null,
            parentFolder = null;

        switch(this.keys_storage){
          case 'cookies':
            client_id = Vue.cookie.get('cadExchanger_clientId');
            client_secret = Vue.cookie.get('cadExchanger_client_secret');
            parentFolder = ue.cookie.get('cadExchanger_parentFolder')
            break;
        
          default:
            client_id = process.env.cadExchanger_clientId;
            client_secret = process.env.cadExchanger_client_secret;
            parentFolder = process.env.cadExchanger_parentFolder;
            break;
        }

      
        if(!client_id){
          throw "Can't proceed without cadExchanger clientId setting. For getting information of CAD Exchanger Auth visit: https://cloud.cadexchanger.com/dev/doc/introduction.html."
        }
        if(!client_secret){
          throw "Can't proceed without cadExchanger client_secret setting. For getting information of CAD Exchanger Auth visit: https://cloud.cadexchanger.com/dev/doc/introduction.html."
        }
        if(!parentFolder){
          throw "Can't proceed without cadExchanger parentFolder ID."
        }

        return {client_id, client_secret, parentFolder}
      },
      authorize: async function(encodedKeys) {
        return await axios.post('https://cloud.cadexchanger.com/api/v1/oauth2/token',{
          grant_type: "client_credentials", 
          scope: "data:read viewer:read data:write data:create data:share"
        },{
          headers:{
            "Authorization": `Basic ${encodedKeys}`
          }
        })
        .then((res) => {
          return res.data.access_token
        })

      },
      getFileContent: async function(){
        return await axios({
          url: this.file_url,
          method: 'GET',
          responseType: 'blob',
        })
        .then((response) => {
          return response.data
        })
      },
      uploadedFileId: async function(file_content){
        const formData = new FormData()
                
        formData.append('parentFolder', this.parentFolder)
        formData.append('data', file_content, this.file_name || 'sample.x_t')

        return await this.requestWithToken('files', 'post', formData, async(res)=>{
          this.revisionId = res.data['file-revision'].id
          this.status_ready = res.data['file-revision'].status == "ready"
          return await res.data.file.public? res.data.file.id : this.publicateFileId(res.data.file.id);
        })
      },
      deleteFile: async function(file_id){
        const id = file_id? file_id: this.file_id;
        return await this.requestWithToken(`files/${id}`, 'delete', null, null).then(res => res.status == 200)
      },
      publicateFileId: async function(file_id){
        const id = file_id? file_id: this.file_id;
        const data = {'public': true}
        this.requestWithToken(`files/${id}/sharing`, 'put', {'public':'true'}, null).then(() => {
          this.file_id =  id
        })
      },
      getRevisionReady: async function(){
        await this.requestWithToken(`filerevisions/${this.revisionId}`,'get',null,null).then(res=>{
          this.status_ready = res.data['file-revision'].status == "ready"
        })
      },
      requestWithToken: async function(endpoint, method, data, callback){
        const config = {
          url: `${this.baseUrl}/${endpoint}`,
          method: method? method: "get",
          data,
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
        return await axios(config).then( res => typeof callback == "function" ? callback(res): res )

      }
    },
    
    watch: {
      token: function (newToken) {
        if(!this.file_id){
          if(!this.file_url){
            throw "Can not display file without file url"
          }
          this.getFileContent().then(file_content => {
           this.uploadedFileId(file_content)
         })
        }
      },
      file_id: function(newFileId){
        const self = this;
        let intr = setInterval( async function() {
          await self.getRevisionReady()
          if (self.status_ready) clearInterval(intr);
        }, 5000)

      }
    },
    beforeDestroy: function(){
      this.deleteFile()
      console.log('DESTROYYYY!!!')
    }
  }
</script>

<style scoped>
</style>