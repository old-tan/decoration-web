import React, { useEffect } from "react"
import { Button, Flex, Form, Input, Select, Modal, Upload, message } from "antd"
const { Dragger } = Upload
import { InboxOutlined } from "@ant-design/icons"

import { useMutation } from "@tanstack/react-query"

import { postItem, updateItem } from "../api"
import { useImmer } from "use-immer"

export function ModuleModal(props) {
  const { isModalOpen, getOpen, detailData, onSuccess, isCreate, attrList } =
    props
  const {
    id,
    name: model_name,
    tags: detail_tags,
    files: modelFiles,
  } = detailData
  const [tags, updateTags] = useImmer([])
  const [isNextOpen, updateIsNextOpen] = useImmer(false)
  const [fileList, updateFileList] = useImmer([])
  // const [thumbs, updateThumbs] = useImmer([])

  const [form] = Form.useForm()
  const normFile = (e) => {
    console.log("Upload event:", e)
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  // set form fields
  const editTags = detail_tags && detail_tags.map((item) => item.value)
  useEffect(() => {
    if (isCreate) {
      form.resetFields()
    } else {
      updateFileList((draft) => {
        return modelFiles.map((file) => ({
          uid: file.id,
          model_id: file.model_id,
          name: file.file_name,
          uri: file.url,
          status: "done",
        }))
      })
      form.setFieldsValue({ name: model_name, tags: [...editTags] })
    }
  }, [isCreate])

  const handleChange = (value) => {
    updateTags(() => value)
  }
  // Mutations
  const mutation = useMutation({
    mutationFn: postItem,
    onSuccess: () => {
      onSuccess()
      getOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateItem,
    onSuccess: (res) => {
      onSuccess()
      getOpen(false)
    },
  })

  // next step
  const handleNext = () => {
    if (!isNextOpen) {
      form
        .validateFields()
        .then((values) => {
          updateIsNextOpen((draft) => true)
        })
        .catch((errorInfo) => {
          console.log("errorInfo---", errorInfo)
        })
    } else {
      updateIsNextOpen((draft) => false)
    }
  }
  const handleOk = () => {
    getOpen(false)
  }
  const handleCancel = () => {
    getOpen(false)
  }

  // handle submit
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const uploads = fileList.map((item) => {
          const { name, uri } = item
          return {
            file_name: name,
            url: uri,
          }
        })
        if (isCreate) {
          // create
          const submitValues = {
            ...values,
            uploads,
          }
          mutation.mutate(submitValues)
        } else {
          // update
          const updateValues = {
            ...detailData,
            ...values,
            uploads,
          }
          updateMutation.mutate({ id, data: updateValues })
        }
      })
      .catch((errorInfo) => {
        console.log("errorInfo---", errorInfo)
      })
  }

  const uploadFileProps = {
    name: "uri",
    multiple: false,
    maxCount: 1,
    defaultFileList: fileList,
    action: `${import.meta.env.VITE_APP_BASE_URL}/upload-files`,
    onChange(info) {
      const { file, fileList: currentFileList } = info
      if (file.status === "done") {
        if (info.file.response) {
          const newList = currentFileList.map((item) => {
            return {
              ...item,
              uri: item.response.uri,
            }
          })
          updateFileList(() => newList)
        }
      }
      // removed: clear fileList
      if (file.status === "removed") {
        updateFileList([])
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files)
    },
  }

  return (
    <>
      <Modal
        forceRender
        title={isCreate ? "Create New Model" : "Edit Model"}
        width={1000}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={
          // <Button key="cancel" onClick={handleCancel}>
          //   cancel
          // </Button>,
          <>
            {!isNextOpen && (
              <Button key="next" type="default" onClick={handleNext}>
                next
              </Button>
            )}
            {isNextOpen && (
              <Button key="submit" type="primary" onClick={handleSubmit}>
                {isCreate ? "Submit" : "Update"}
              </Button>
            )}
            {/* <Button key="submit" type="primary" onClick={handleSubmit}>
              {isCreate ? "Submit" : "Update"}
            </Button> */}
          </>
        }
      >
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
              value={tags}
              style={{ width: "100%" }}
              placeholder="multiple Mode"
              onChange={handleChange}
              options={attrList}
            />
          </Form.Item>
        </Form>
        {isNextOpen && (
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
          >
            {/* <Form.Item label="UploadThumb">
              <Form.Item getValueFromEvent={normFile} noStyle>
                <Dragger
                  name="uri"
                  multiple={false}
                  maxCount={1}
                  defaultFileList={thumbs}
                  action={`${import.meta.env.VITE_APP_BASE_URL}/upload-files`}
                  onChange={(info) => {
                    const { file, fileList: currentFileList } = info
                    if (file.status === "done") {
                      if (info.file.response) {
                        updateThumbs(() => currentFileList)
                      }
                    }
                  }}
                  onDrop={(e) => {
                    console.log("Dropped files", e.dataTransfer.files)
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file</p>
                </Dragger>
              </Form.Item>
            </Form.Item> */}
            <Form.Item label="UploadModel">
              <Form.Item getValueFromEvent={normFile} noStyle>
                <Dragger {...uploadFileProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file</p>
                </Dragger>
              </Form.Item>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  )
}
