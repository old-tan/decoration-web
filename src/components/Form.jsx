import { Button, Form, Input, message, Upload } from "antd"

export function Form() {
  const [form] = Form.useForm()
  return (
    <>
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
