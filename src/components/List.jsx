import React, { useState } from "react"
import { Pagination, Button, Flex } from "antd"
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import { getList } from "../api"

import { Filter } from "./Filter"
import { ModuleModal } from "./ModuleModal"

import { Avatar, List } from "antd"

// Create a client
const queryClient = new QueryClient()
// get list
export function ModuleList() {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["list"],
    queryFn: getList,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = () => {
    setIsModalOpen(true)
  }

  const delItem = (id) => {
    console.log("id----", id)
  }

  const getChildModal = (modalOpen) => {
    setIsModalOpen(modalOpen)
  }

  const getChildMute = (mute) => {
    console.log("mute---", mute)
    mute && queryClient.invalidateQueries({ queryKey: ["list"] })
  }

  return (
    <>
      {/* modal */}
      <ModuleModal
        isModalOpen={isModalOpen}
        getOpen={getChildModal}
        getMute={getChildMute}
      />
      <Flex gap="middle" vertical>
        <Flex align="center" gap="middle" justify="space-between">
          <Filter />
          <Button type="primary" onClick={openModal}>
            create
          </Button>
        </Flex>

        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <a key="list-loadmore-edit">edit</a>,
                <a key="list-loadmore-more" onClick={() => delItem(item.id)}>
                  delete
                </a>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                  />
                }
                title={<a href="https://ant.design">{item.name}</a>}
                description={`created_at ${item.created_at} updated_at ${item.updated_at}`}
              />
            </List.Item>
          )}
        />
        <Pagination defaultCurrent={1} total={50} />
      </Flex>
    </>
  )
}
