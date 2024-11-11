import React, { useState, useEffect } from "react"
import { Button, Form, Input, message, Upload } from "antd"
import { InboxOutlined } from "@ant-design/icons"
import axios from "axios"
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
// Create a client
const queryClient = new QueryClient()

import { getList, postItem } from "./api"

const { Dragger } = Upload
// import axios from "axios"
const App = () => {
  // upload file
  const props = {
    name: "lod",
    multiple: false,
    action: "http://localhost:3031/uploads",
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
    <QueryClientProvider client={queryClient}>
      <List />

      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p>
      </Dragger>
    </QueryClientProvider>
  )
}
// get list
function List() {
  const [form] = Form.useForm()

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["list"],
    queryFn: getList,
  })

  // Mutations
  const mutation = useMutation({
    mutationFn: postItem,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["list"] })
    },
  })

  const onFinish = (value) => {
    console.log("value---", value)
    mutation.mutate(value)
  }

  return (
    <>
      <ul>
        {data &&
          data.map((item) => (
            <li key={item.id}>
              <p>{item.id}</p>
              <p>{item.lod0}</p>
              <p>{item.lod1}</p>
              <p>{item.lod2}</p>
              <p>{item.thumb}</p>
            </li>
          ))}
      </ul>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="lod0" label="lod0">
          <Input placeholder="input placeholder" />
        </Form.Item>
        <Form.Item name="lod1" label="lod1">
          <Input placeholder="input placeholder" />
        </Form.Item>
        <Form.Item name="lod2" label="lod2">
          <Input placeholder="input placeholder" />
        </Form.Item>
        <Form.Item name="thumb" label="thumb">
          <Input placeholder="input placeholder" />
        </Form.Item>
        <Form.Item name="photo" label="photo">
          <Input placeholder="input placeholder" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
export default App
