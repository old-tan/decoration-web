import { Canvas } from "@react-three/fiber"
import { Stage, Gltf, OrbitControls } from "@react-three/drei"
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
} from "antd"
const { Meta } = Card
import { useEffect, useState } from "react"
export const DetailModal = (props) => {
  const { getOpen, isDetailOpen, detailData } = props
  const { name: model_name, files, tags, created_at, updated_at } = detailData
  // const [options, setOptions] = useState([
  //   {
  //     label: "lods0",
  //     value: "lods0",
  //     url: "",
  //   },
  //   {
  //     label: "lods1",
  //     value: "lods1",
  //     url: "",
  //   },
  //   {
  //     label: "lods2",
  //     value: "lods2",
  //     url: "",
  //   },
  //   {
  //     label: "thumb",
  //     value: "thumb",
  //     url: "",
  //   },
  // ])
  const [curUrl, setCurUrl] = useState("")
  const [curVal, setCurVal] = useState("")
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
      children: tags.map((item) => {
        const { key, value } = item
        return (
          <Tag bordered={false} key={key}>
            {key}:{value}
          </Tag>
        )
      }),
    },
  ]

  useEffect(() => {
    files.length &&
      setCurUrl(`${import.meta.env.VITE_APP_BASE_URL}${files[0].url}`)
  }, [files])
  // useEffect(() => {
  //   if (!files || files.length === 0) return
  //   // Map over options and update URLs based on files slot match
  //   const updatedOptions = options.map((option) => {
  //     const matchedFile = files.find((file) => file.slot === option.label)
  //     return {
  //       ...option,
  //       url: matchedFile
  //         ? `http://localhost:3030${matchedFile.url}`
  //         : option.url,
  //     }
  //   })

  //   // Set curUrl to the first option's URL
  //   if (updatedOptions.length > 0) {
  //     const hasUrlIndex = updatedOptions.findIndex((item) => item)
  //     setCurUrl(updatedOptions[hasUrlIndex].url)
  //     setCurVal(updatedOptions[hasUrlIndex].value)
  //     setOptions(updatedOptions)
  //   }
  // }, [files])

  // const handleChange = async (val) => {
  //   setCurUrl("")
  //   setCurVal("")
  //   const matchedFile = await options.find((item) => item.value === val)
  //   setCurUrl(matchedFile.url)
  //   setCurVal(matchedFile.value)
  // }

  return (
    <>
      <Modal
        title=""
        open={isDetailOpen}
        onOk={() => getOpen(false)}
        onCancel={() => getOpen(false)}
        width={1000}
      >
        <Flex vertical="column">
          <Descriptions title="Model Info" items={descs} />
          <Flex
            style={{ marginTop: "20px", width: "100%", height: "500px" }}
            align="center"
            vertical="column"
          >
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
            {curUrl ? (
              <Canvas>
                <Stage center>
                  <Gltf src={curUrl} />
                </Stage>
                <OrbitControls />
              </Canvas>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}
