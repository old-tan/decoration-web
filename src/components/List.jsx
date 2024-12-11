import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useImmer } from "use-immer"

import {
  Pagination,
  Button,
  Flex,
  Tag,
  Modal,
  List,
  Select,
  Card,
  Image,
  Space,
} from "antd"
const { Meta } = Card
import { ExclamationCircleFilled } from "@ant-design/icons"

import { getList, deleteItem, getAttributes } from "../api"

import { CreateModal } from "./CreateModal"
// import { EditModal } from "./EditModal"
import { DetailModal } from "./DetailModal"

const { confirm } = Modal

// get list
export function ModelList() {
  // Create a client
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [itemData, setItemData] = useState({})

  const [state, updateState] = useImmer({
    filterValue: [],
    currentPage: 1,
    pageSize: 20,
  })

  // getAttr
  const { data: attrList } = useQuery({
    queryKey: ["attr"],
    queryFn: () => getAttributes(),
  })

  const [options, updateOptions] = useImmer(attrList)
  useEffect(() => {
    attrList &&
      updateOptions((draft) => {
        return attrList.map((item) => {
          return {
            label: `${item.key}:${item.value}`,
            value: `${item.key}:${item.value}`,
          }
        })
      })
  }, [attrList, updateOptions])

  // getList
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["list", state.currentPage, state.pageSize],
    queryFn: () => getList({ page: state.currentPage, limit: state.pageSize }),
  })

  // handle select change
  const handleFilterChange = (value) => {
    console.log("value---", value)
    updateState((draft) => {
      draft.filterValue = value.map((item) => item.split(":")[1])
    })
  }

  // handle search & filter
  const filteredList = data?.data.filter((item) =>
    state.filterValue.length === 0
      ? true
      : item.tags.some((tag) =>
          state.filterValue.some((searchItem) =>
            // 模糊匹配
            tag.value.toLowerCase().includes(searchItem.toLowerCase())
          )
        )
  )

  // Pagination change handler
  const onPaginationChange = (page, pageSize) => {
    updateState((draft) => {
      draft.currentPage = page
      draft.pageSize = pageSize
    })
  }

  const mutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["list"])
    },
  })

  const openModal = async () => {
    setItemData({})
    setIsModalOpen(true)
  }

  const editItem = (item) => {
    setItemData(item)
    setIsModalOpen(true)

    // setIsEditModalOpen(true)
  }

  const getChildModal = (modalOpen) => {
    setIsModalOpen(modalOpen)
  }
  // const getEditChildModal = (val) => {
  //   setIsEditModalOpen(val)
  // }
  const getDetailOpen = (val) => {
    setIsDetailOpen(val)
  }
  const showDetail = (item) => {
    const { id } = item
    setItemData(item)
    setIsDetailOpen(true)
  }
  const showDeleteConfirm = (item) => {
    const { id } = item
    confirm({
      title: "Delete",
      icon: <ExclamationCircleFilled />,
      content: "Are you sure delete this task?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        mutation.mutate(id)
      },
      onCancel() {
        console.log("Cancel")
      },
    })
  }

  return (
    <>
      {/* detail Modal */}
      {isDetailOpen && (
        <DetailModal
          getOpen={getDetailOpen}
          isDetailOpen={isDetailOpen}
          detailData={itemData}
        />
      )}
      {/* create modal */}
      {isModalOpen && (
        <CreateModal
          isModalOpen={isModalOpen}
          detailData={itemData}
          getOpen={getChildModal}
          onSuccess={() => {
            queryClient.invalidateQueries(["list"])
          }}
        />
      )}
      {/* edit modal */}
      {/* {isEditModalOpen && (
        <EditModal
          isModalOpen={isEditModalOpen}
          detailData={itemData}
          getOpen={getEditChildModal}
          attrList={options}
          onSuccess={() => {
            queryClient.invalidateQueries(["list"])
          }}
        />
      )} */}
      <Flex gap="middle" vertical>
        <Flex align="center" gap="middle" justify="space-between">
          {/* <Filter /> */}
          <Select
            mode="multiple"
            // value={state.filterValue}
            defaultValue={state.filterValue}
            style={{ width: "100%" }}
            placeholder="Input or select tags to filter results"
            onChange={handleFilterChange}
            options={options}
            // optionRender={(option) => (
            //   <Space>
            //     <span>{option.data.value}</span>({option.data.label})
            //   </Space>
            // )}
            allowClear={true}
          />
          <Button type="primary" onClick={openModal}>
            create
          </Button>
        </Flex>
        <List
          dataSource={filteredList}
          grid={{
            gutter: 16,
            xs: 2,
            sm: 3,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 6,
          }}
          renderItem={(item, index) => (
            <List.Item>
              <Card
                hoverable
                key={item.id}
                title={item.name}
                extra={
                  <a href="#" onClick={() => showDetail(item)}>
                    Info
                  </a>
                }
                actions={[
                  <Button
                    key="edit"
                    color="primary"
                    variant="outlined"
                    onClick={() => editItem(item)}
                  >
                    edit
                  </Button>,
                  <Button
                    key="delete"
                    color="danger"
                    variant="dashed"
                    onClick={() => showDeleteConfirm(item)}
                  >
                    delete
                  </Button>,
                ]}
              >
                <Flex
                  gap="small"
                  vertical
                  style={{ height: "100px", overflowY: "auto" }}
                >
                  <Flex gap="small" align="center">
                    CreateAt:
                    <Meta title="" description={item.created_at} />
                  </Flex>

                  <Flex gap="small" align="center">
                    UpdateAt:
                    <Meta title="" description={item.updated_at} />
                  </Flex>
                  <Flex gap="small" align="center" wrap>
                    Tags:
                    {item.tags &&
                      item.tags.map((item) => (
                        <Tag bordered={false} key={`${item.key}-${item.value}`}>
                          {item.key}:{item.value}
                        </Tag>
                      ))}
                  </Flex>
                </Flex>
              </Card>
            </List.Item>
          )}
        />
        <Pagination
          align="end"
          current={state.currentPage}
          pageSize={state.pageSize}
          total={data?.total || 0}
          showTotal={(total) => `Total ${total} items`}
          onChange={onPaginationChange}
        />
      </Flex>
    </>
  )
}
