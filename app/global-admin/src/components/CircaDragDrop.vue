<script>
export default {
  name: 'circa-drag-drop',

  data () {
    return {
      dragAndDropCapable: false,
      files: []
    }
  },

  mounted () {
    this.dragAndDropCapable = this.isBrowserDragAndDropCapable()

    if (this.dragAndDropCapable) {
      const dragEvents = ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop']

      dragEvents.forEach((event) => {
        this.$refs.fileform.addEventListener(event, (e) => {
          e.preventDefault()
          e.stopPropagation()
        }, false)
      })

      this.$refs.fileform.addEventListener('drop', (e) => {
        const droppedFiles = e.dataTransfer.files
        const droppedFilesLength = droppedFiles.length
        for (let i = 0; i < droppedFilesLength; i++) {
          const fileIsImg = /\.(jpe?g|png|gif)$/i.test(droppedFiles[i].name)
          if (fileIsImg) {
            this.files.push(droppedFiles[i])
          }
        }
      })
    }
  },

  methods: {
    onFileSelected (event) {
      const droppedFiles = event.target.files
      const droppedFilesLength = droppedFiles.length
      for (let i = 0; i < droppedFilesLength; i++) {
        const fileIsImg = /\.(jpe?g|png|gif)$/i.test(droppedFiles[i].name)
        if (fileIsImg) {
          this.files.push(droppedFiles[i])
        }
      }
    },
    removeFile (index) {
      this.files.splice(index, 1)
    },
    isBrowserDragAndDropCapable () {
      const div = document.createElement('div')
      const dragEventsAvailable = (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
      const formAndFileApisAvailable = 'FormData' in window && 'FileReader' in window
      return dragEventsAvailable && formAndFileApisAvailable
    },
    getImagePreviews () {
      for (let i = 0; i < this.files.length; i++) {
        const fileIsImg = /\.(jpe?g|png|gif)$/i.test(this.files[i].name)

        if (fileIsImg) {
          // Create File Reader
          let reader = new FileReader()

          // Add an event listener for when the file has been loaded to update the src on the file preview.
          reader.addEventListener('load', () => {
            this.$refs['preview' + i][0].src = reader.result
          }, false)

          // Read the data for the file in through the reader. When loaded, we listen and set the image src.
          reader.readAsDataURL(this.files[i])
        }
      }
    }
  },

  watch: {
    files () {
      this.getImagePreviews()
      this.$emit('input', this.files)
    }
  }
}
</script>

<template>
  <div id="file-drag-drop">
    <form ref="fileform">
      <div class="drop-files">
        <input type="file" @change="onFileSelected" multiple>
        Click or Drop the files here to upload!
      </div>
    </form>
    <div v-if="files.length > 0" class="files-wrapper">
      <div v-for="(file, index) in files" class="file-item" :key="index">
        <img class="preview" :ref="'preview' + index"/>
        <p class="file-name">
          {{file.name}}
        </p>
        <p class="file-count">
          {{index + 1}}
        </p>
        <div class="remove-container">
          <a class="remove" @click="removeFile(index)"><i class="fas fa-times"></i></a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  form {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 5px dashed #E1E1E1;
    height: 225px;
    width: 100%;
    margin: auto;
    text-align: center;
    border-radius: 5px;
    position: relative;

    &:hover {
      background: #f7f7f7;
    }
  }

  .drop-files {
    input {
      cursor: pointer;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }

  .files-wrapper {
    background: #f7f7f7;
    border: 1px solid #E1E1E1;
    border-radius: 5px;
    margin-top: 30px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 30px;
  }

  .file-item {
    width: 120px;
    padding: 10px;
    text-align: center;
    position: relative;

    &:hover {
      .remove-container {
        opacity: 1;
      }
    }

    .file-name {
      font-size: 10px;
      word-break: break-word;
    }

    .file-count {
      color: #9A9A9A;
      font-size: 14px;
      font-weight: bold;
    }

    .remove-container {
      position: absolute;
      right: 0;
      top: 0;

      background: #ff4545;
      color: #fff;
      cursor: pointer;
      height: 20px;
      width: 20px;
      font-size: 12px;
      padding-top: 2px;
      border-radius: 20px;
      opacity: 0;
      transition: all 300ms ease;
    }

    img {
      width: 100%;
    }
  }
</style>
