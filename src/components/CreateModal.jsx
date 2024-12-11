import React, { useEffect, useState, useRef } from "react"
import {
  Button,
  Flex,
  Form,
  Input,
  Select,
  Modal,
  Upload,
  message,
  Table,
  Tabs,
  Popconfirm,
  Space,
} from "antd"
import { InboxOutlined, UploadOutlined } from "@ant-design/icons"

import { useMutation, useQuery } from "@tanstack/react-query"

import {
  postItem,
  updateItem,
  updateModelFiles,
  deleteModelFile,
  getModelFiles,
} from "../api"
import { useImmer } from "use-immer"

import {
  buildTreeWithLimitedDepth,
  deleteNodeById,
  insertNodeById,
} from "../utils"

export function CreateModal(props) {
  const { isModalOpen, getOpen, detailData, onSuccess } = props
  const { id, name: model_name, tags: detail_tags } = detailData
  // const [thumbs, updateThumbs] = useImmer([])
  const [fileTree, updateFileTree] = useImmer([]) // tree data
  const [activeKey, setActiveKey] = useState("1")
  const [isCreate, setIsCreate] = useState(true)
  const [modelId, setModelId] = useState("")
  const [curRecord, updateCurRecord] = useImmer({})
  const [tabItems, updateTabItems] = useImmer([
    {
      label: "ModelInfo",
      key: "1",
      children: "",
    },
    {
      label: "ModelFile",
      key: "2",
      children: "",
      disabled: true,
    },
  ])
  const [form] = Form.useForm()
  // get model-files
  const { data: modelData } = useQuery({
    queryKey: ["model-files"],
    queryFn: () => getModelFiles({ model_id: id }),
  })

  useEffect(() => {
    console.log("enter1---")
    if (id) {
      console.log("enter2---")
      // edit
      setIsCreate(false)
      setModelId(id)

      // generate tree
      if (modelData?.length > 0) {
        // const { modelfiles } = modelData
        const treeData = buildTreeWithLimitedDepth(modelData)
        updateFileTree(() => treeData)
      }

      // set form
      const editTags = detail_tags.map((item) => `${item.key}:${item.value}`)
      form.setFieldsValue({ name: model_name, tags: [...editTags] })
      // handle tabs
      updateTabItems((draft) => {
        const targetItem = draft.find((item) => item.key === "2")
        if (targetItem) {
          targetItem.disabled = false
        }
      })
    } else {
      // create
      setIsCreate(true)
      form.resetFields()
    }
  }, [detailData, modelData, updateFileTree, detail_tags, id])

  // Mutations
  const mutation = useMutation({
    mutationFn: postItem,
    onSuccess: (res) => {
      setModelId(res.data.id)
      updateTabItems((draft) => {
        const targetItem = draft.find((item) => item.key === "2")
        if (targetItem) {
          targetItem.disabled = false
        }
      })
      setActiveKey("2")
      setIsCreate(false)

      onSuccess()
      // getOpen(false)
    },
  })
  const updateMutation = useMutation({
    mutationFn: updateItem,
    onSuccess: (res) => {
      onSuccess()
      // getOpen(false)
    },
  })
  const deleteMutaion = useMutation({
    mutationFn: deleteModelFile,
    onSuccess: (res) => {
      updateFileTree((draft) => deleteNodeById(draft, res.data.id))
    },
  })

  const updateModelFilesMutation = useMutation({
    mutationFn: updateModelFiles,
    onSuccess: (res) => {
      message.success(`Aliases updates successfully`)
    },
  })

  // tab change
  const handleTabsChange = (val) => {
    setActiveKey(val)
  }
  // form finish
  const onFinish = (values) => {
    console.log("Success:", values)
    const { tags } = values
    // filter tags, keep only xx:xx
    const filteredTags = tags.reduce((acc, item) => {
      const [key, value] = item.split(":").map((part) => part.trim())
      if (key && value) {
        acc.push({ key, value })
      }
      return acc
    }, [])
    filteredTags.length === 0 && form.setFieldsValue({ tags: [] })
    if (filteredTags.length === 0) {
      form.setFieldsValue({ tags: [] })
      message.error("tags input is invalid")
    } else {
      isCreate
        ? mutation.mutate({ ...values, tags: [...filteredTags] })
        : updateMutation.mutate({
            id: modelId,
            data: {
              ...detailData,
              ...values,
              tags: [...filteredTags],
            },
          })
    }
  }
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
  }

  const handleOk = () => {
    getOpen(false)
  }
  const handleCancel = () => {
    getOpen(false)
  }

  // save aliases
  const handleSaveAliases = (record) => {
    const { id, aliases } = record
    updateModelFilesMutation.mutate({ id, data: { id, aliases } })
  }

  const updateNodeField = (key, field, value) => {
    updateFileTree((draft) => {
      const updateFieldRecursive = (nodes) => {
        for (let node of nodes) {
          if (node.key === key) {
            node[field] = value // 修改字段
            return true // 找到目标节点后终止递归
          }
          if (node.children) {
            const found = updateFieldRecursive(node.children)
            if (found) return true // 继续向上返回
          }
        }
        return false
      }

      updateFieldRecursive(draft)
    })
  }
  // delete model item
  const handleDelete = (record) => {
    const { id } = record
    deleteMutaion.mutate(id)
  }
  // handle item upload
  const handleItemUpload = (record) => {
    updateCurRecord(record)
  }
  // upload model item
  const itemProps = {
    name: "file",
    showUploadList: false,
    data: {
      model_id: modelId,
      subPath: curRecord.path,
    },
    action: `${import.meta.env.VITE_APP_BASE_URL}/upload-item`,
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      const { file } = info

      if (file.status === "done") {
        message.success(`${file.name} file uploaded successfully`)
        const { file_name: name, id, model_id, aliases, url } = file.response
        const relativePath = url.split("/").slice(2).join("/")
        const newNode = {
          id,
          name,
          model_id,
          aliases,
          key: relativePath,
          path: relativePath,
          isLeaf: true,
        }

        updateFileTree((draft) => insertNodeById(draft, curRecord.id, newNode))
      } else if (file.status === "error") {
        const { error } = file.response
        error.code === "EEXIST"
          ? message.error(`the field is EEXIST`)
          : message.error(`${file.name} file upload failed.`)
      }
    },
  }

  // upload zip
  const uploadFileProps = {
    name: "uri",
    accept: ".zip",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    action: `${import.meta.env.VITE_APP_BASE_URL}/upload-files`,
    data: {
      model_id: modelId,
    },
    onChange(info) {
      const { file } = info
      if (file.status === "done" && file.response) {
        const modelFiles = file.response.modelFiles
        const treeData = buildTreeWithLimitedDepth(modelFiles)
        updateFileTree(treeData)
      }
      // if (file.status === "removed") {
      //   updateFileTree([])
      // }
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
    // {
    //   title: "Url",
    //   dataIndex: "key",
    //   key: "Url",
    // },
    {
      title: "Aliases",
      dataIndex: "aliases",
      key: "aliases",
      width: 400,
      render: (text, record, index) => {
        if (record.isLeaf) {
          return (
            <Flex gap={10} align="center">
              <Input
                defaultValue={text}
                onBlur={(e) => {
                  const value = e.target.value
                  updateNodeField(record.key, "aliases", value) // 修改 aliases 字段
                }}
                onPressEnter={(e) => {
                  const value = e.target.value
                  updateNodeField(record.key, "aliases", value) // 修改 aliases 字段
                }}
              />
              <a onClick={() => handleSaveAliases(record)}>Save</a>
              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => handleDelete(record)}
              >
                <a>Delete</a>
              </Popconfirm>
            </Flex>
          )
        } else {
          return (
            <Flex justify="end">
              <Upload {...itemProps}>
                <Button
                  icon={<UploadOutlined />}
                  size="small"
                  onClick={() => handleItemUpload(record)}
                >
                  Upload Item
                </Button>
              </Upload>
            </Flex>
          )
        }
      },
    },
  ]

  return (
    <Modal
      forceRender
      title={`${isCreate ? "Create New Model" : "Edit Model"}`}
      width={1000}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
    >
      <Tabs
        defaultActiveKey="1"
        activeKey={activeKey}
        onChange={(val) => handleTabsChange(val)}
        centered
        items={tabItems}
      />
      {activeKey === "1" ? (
        <Form
          form={form}
          scrollToFirstError
          style={{
            paddingBlock: 32,
          }}
          labelCol={{
            span: 3,
          }}
          wrapperCol={{
            span: 20,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="name"
            label="ModuleName"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tags"
            label="Tags"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="tags input: xx:xx valid | press enter or blur"
              tokenSeparators={[","]}
            />
          </Form.Item>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              {isCreate ? "Create" : "Update"}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <>
          <Upload {...uploadFileProps}>
            <Button icon={<UploadOutlined />}>
              Click or drag file to Upload
            </Button>
          </Upload>

          {fileTree.length > 0 && (
            <Table
              style={{ width: "100%", padding: "20px 0" }}
              columns={columns}
              dataSource={fileTree}
              pagination={false}
              size="small"
            />
          )}
        </>
      )}
    </Modal>
  )
}
