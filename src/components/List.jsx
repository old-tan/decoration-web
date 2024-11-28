import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useImmer } from "use-immer"

import {
  Pagination,
  Button,
  Flex,
  Tag,
  Modal,
  Avatar,
  List,
  Select,
} from "antd"
import { ExclamationCircleFilled } from "@ant-design/icons"

import { getList, deleteItem, getAttributes } from "../api"

import { ModuleModal } from "./ModuleModal"
import { DetailModal } from "./DetailModal"

const { confirm } = Modal

// get list
export function ModuleList() {
  // Create a client
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreate, setIsCreate] = useState(true)
  const [itemData, setItemData] = useState({})

  const [state, updateState] = useImmer({
    filterValue: [],
    currentPage: 1,
    pageSize: 10,
  })

  // getAttr
  const { data: attrList } = useQuery({
    queryKey: ["attr"],
    queryFn: () => getAttributes(),
  })

  const [options, updateOptions] = useImmer([])

  useEffect(() => {
    attrList &&
      updateOptions(
        attrList.map((item) => {
          const { key: label, value } = item
          return {
            label,
            value,
          }
        })
      )
  }, [attrList])

  // getList
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["list", state.currentPage, state.pageSize],
    queryFn: () => getList({ page: state.currentPage, limit: state.pageSize }),
  })

  // handle select change
  const handleFilterChange = (value) => {
    updateState((draft) => {
      draft.filterValue = value
    })
  }

  // handle search & filter
  const filteredList = data?.data.filter((item) =>
    state.filterValue.length === 0
      ? true
      : item.tags.some((tag) =>
          state.filterValue.some((searchItem) =>
            // 模糊匹配
            tag.key.toLowerCase().includes(searchItem.toLowerCase())
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
    setIsCreate(true)
    setIsModalOpen(true)
  }

  const editItem = (item) => {
    setItemData(item)
    setIsCreate(false)
    setIsModalOpen(true)
  }

  const getChildModal = (modalOpen) => {
    setIsModalOpen(modalOpen)
  }
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
      {/* create/edit modal */}
      {isModalOpen && (
        <ModuleModal
          isCreate={isCreate}
          isModalOpen={isModalOpen}
          detailData={itemData}
          getOpen={getChildModal}
          attrList={options}
          onSuccess={() => {
            queryClient.invalidateQueries(["list"])
          }}
        />
      )}
      <Flex gap="middle" vertical>
        <Flex align="center" gap="middle" justify="space-between">
          {/* <Filter /> */}
          <Select
            mode="multiple"
            // value={state.filterValue}
            defaultValue={state.filterValue}
            style={{ width: "100%" }}
            placeholder="multiple Mode"
            onChange={handleFilterChange}
            options={options}
            allowClear={true}
          />
          <Button type="primary" onClick={openModal}>
            create
          </Button>
        </Flex>

        <List
          itemLayout="horizontal"
          dataSource={filteredList}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <a key="edit" onClick={() => showDetail(item)}>
                  查看
                </a>,
                <a key="edit" onClick={() => editItem(item)}>
                  edit
                </a>,
                <Button
                  key="delete"
                  onClick={() => showDeleteConfirm(item)}
                  type="dashed"
                >
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                  />
                }
                title={<a onClick={() => showDetail(item)}>{item.name}</a>}
                description={
                  <Flex gap="4px 0" wrap>
                    标签:
                    {item.tags &&
                      item.tags.map((item) => (
                        <Tag bordered={false} key={item.value}>
                          {item.key}:{item.value}
                        </Tag>
                      ))}
                  </Flex>
                }
              />
              <p>{item.updated_at}</p>
            </List.Item>
          )}
        />
        <Pagination
          current={state.currentPage}
          pageSize={state.pageSize}
          total={data?.total || 0}
          onChange={onPaginationChange}
        />
      </Flex>
    </>
  )
}
