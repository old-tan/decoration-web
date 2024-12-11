import { Canvas } from "@react-three/fiber"
import { Stage, Gltf, OrbitControls } from "@react-three/drei"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Segmented,
  Modal,
  message,
  Flex,
  Empty,
  Tag,
  Card,
  Image,
  Descriptions,
  Table,
} from "antd"
import { useImmer } from "use-immer"
const { Meta } = Card
import { useEffect, useState } from "react"
import { getModelAttributes, getModelFiles } from "../api"
import { buildTreeWithLimitedDepth } from "../utils"
export const DetailModal = (props) => {
  const { getOpen, isDetailOpen, detailData } = props
  const { id, name: model_name, created_at, updated_at } = detailData
  const [fileTree, updateFileTree] = useImmer([])

  // getAttr
  const { data: tags } = useQuery({
    queryKey: ["attr"],
    queryFn: () => getModelAttributes({ model_id: id }),
  })

  // get model-files
  const { data: modelData } = useQuery({
    queryKey: ["model-files"],
    queryFn: () => getModelFiles({ model_id: id }),
  })

  useEffect(() => {
    if (modelData) {
      // const { modelzip, modelfiles } = modelData
      const treeData = buildTreeWithLimitedDepth(modelData)
      updateFileTree(() => treeData)
    }
  }, [id, modelData, updateFileTree])

  const descs = [
    {
      key: "ModelName",
      label: "ModelName",
      children: model_name,
    },
    {
      key: "CreateAt",
      label: "CreateAt",
      children: created_at,
    },
    {
      key: "UpdateAt",
      label: "UpdateAt",
      children: updated_at,
    },
    {
      key: "Tags",
      label: "Tags",
      children:
        tags.length > 0 &&
        tags.map((item) => {
          const { key, value } = item
          return (
            <Tag bordered={false} key={`${key}-${value}`}>
              {key}:{value}
            </Tag>
          )
        }),
    },
  ]
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
    },
  ]
  return (
    <>
      <Modal
        title=""
        open={isDetailOpen}
        onOk={() => getOpen(false)}
        onCancel={() => getOpen(false)}
        width={1200}
        footer={null}
      >
        <Flex vertical="column">
          <Descriptions title="Model Info" items={descs} />
          <Flex align="center" vertical="column">
            {fileTree.length > 0 && (
              <Table
                style={{ width: "100%", padding: "20px 0" }}
                columns={columns}
                // dataSource={modelTree}
                dataSource={fileTree}
                pagination={false}
              />
            )}
            {/* <Segmented
              value={curVal}
              options={options}
              onChange={handleChange}
            /> */}
            {/* {curUrl ? (
              curVal.includes("lods") ? (
                <Canvas>
                  <Stage center>
                    <Gltf src={curUrl} />
                  </Stage>
                  <OrbitControls />
                </Canvas>
              ) : (
                <Image width={300} src={curUrl} />
              )
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )} */}
            {/* {curUrl ? (
              <Canvas>
                <Stage center>
                  <Gltf src={curUrl} />
                </Stage>
                <OrbitControls />
              </Canvas>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )} */}
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}
