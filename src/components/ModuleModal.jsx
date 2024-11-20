import React, { useState } from "react"
import { Button, Flex, Form, Input, Select, Modal, Upload, message } from "antd"
import axios from "axios"
const { Dragger } = Upload
import { InboxOutlined, UploadOutlined } from "@ant-design/icons"
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import { getList, postItem } from "../api"
const queryClient = new QueryClient()
export function ModuleModal(props) {
  const { isModalOpen, getOpen, getMute } = props
  const [form] = Form.useForm()
  const normFile = (e) => {
    console.log("Upload event:", e)
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  // Mutations
  const mutation = useMutation({
    mutationFn: postItem,
    onSuccess: () => {
      getMute(true)
      // Invalidate and refetch
      // queryClient.invalidateQueries({ queryKey: ["list"] })
    },
  })

  const onFinish = (values) => {
    console.log("values---", values)
    mutation.mutate(values)
  }

  // const [isModalOpen, setIsModalOpen] = useState(false)
  // const showModal = () => {
  //   setIsModalOpen(true)
  // }
  const handleOk = () => {
    // setIsModalOpen(false)
    getOpen(false)
  }
  const handleCancel = () => {
    // setIsModalOpen(false)
    getOpen(false)
  }

  const uploadProps = {
    name: "uri",
    multiple: false,
    action: "http://localhost:3030/upload-files",
    onChange(info) {
      const { status } = info.file
      if (status !== "uploading") {
        console.log(info.file, info.fileList)
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files)
    },
  }

  return (
    <>
      {/* <Button type="primary" onClick={showModal}>
        Open Modal
      </Button> */}
      <Modal
        forceRender
        title="Basic Modal"
        width={1000}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer
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
          onFinish={onFinish}
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
          <Form.Item label="Dragger">
            <Form.Item
              // name="dragger"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Flex justify="space-between">
                <Flex align="center" gap="middle" vertical>
                  <Select
                    options={[{ value: "sample", label: <span>sample</span> }]}
                  />
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload. Strictly prohibited
                      from uploading company data or other banned files.
                    </p>
                  </Dragger>
                </Flex>
              </Flex>
            </Form.Item>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 10,
            }}
          >
            <Flex gap="small">
              <Button danger onClick={() => form.resetFields()}>
                Reset
              </Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
