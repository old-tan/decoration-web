import { useState } from "react"
// import SparkMD5 from "spark-md5"
import { InboxOutlined } from "@ant-design/icons"
import { message, Upload, Tree, Table } from "antd"
const { DirectoryTree } = Tree
const { Dragger } = Upload
// import JSZip from "jszip"
import { useImmer } from "use-immer"
// import { buildNestedObject, convertToTreeData } from "../utils"

export const ModelZipUpload = () => {
  // const [md5, setMd5] = useImmer("") // md5
  const [fileTree, updateFileTree] = useImmer([]) // tree data

  // generate tree Data for preview zip file
  // const generateTreeData = (paths) => {
  //   const nestedObject = buildNestedObject(paths)
  //   return convertToTreeData(nestedObject)
  // }

  const props = {
    name: "uri",
    multiple: false,
    maxCount: 1,
    action: `${import.meta.env.VITE_APP_BASE_URL}/upload-files`,
    onChange({ file, fileList }) {
      console.log("onchange-file---", file)
      if (file.status === "done") {
        updateFileTree(() => file.response.tree)
      }
    },
    beforeUpload: async (file) => {
      console.log("before-file---", file)

      // // calc md5
      // const reader = new FileReader()
      // reader.onload = (e) => {
      //   const fileBuffer = e.target.result
      //   const md5 = SparkMD5.ArrayBuffer.hash(fileBuffer)
      //   console.log("md5---", md5)
      // }
      // reader.onerror = (err) => {
      //   console.error("FileReader Error:", err)
      // }

      // // call read method
      // reader.readAsArrayBuffer(file)

      // zip preview
      // const content = await JSZip.loadAsync(file)
      // const paths = Object.keys(content.files)
      // const treeData = generateTreeData(paths)
      // setFileTree(() => treeData)

      // // Update file list for display
      // setFileList((draft) => {
      //   draft.push(file)
      // })
      return true
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files)
    },
  }
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Url",
      dataIndex: "key",
      key: "Url",
    },
    {
      title: "AliasesName",
      dataIndex: "aliasesName",
      key: "aliasesName",
    },
  ]

  return (
    <>
      <h1>Zip upload</h1>
      {/* upload */}
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        {/* <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p> */}
      </Dragger>
      {/* preview */}
      {/* {fileTree.length > 0 && <DirectoryTree treeData={fileTree} />} */}
      {fileTree.length > 0 && (
        <Table
          columns={columns}
          dataSource={fileTree}
          pagination={false}
          size="small"
        />
      )}
    </>
  )
}
