import axios from "axios"
import request from "@/service/request"

// getList
export const getList = async ({ page, limit }) => {
  const res = await request.get("/models", {
    $skip: (page - 1) * limit,
    $limit: limit,
  })
  return res.data
}

// create
export const postItem = async (data) => {
  const res = await request.post("/models", data)
  return res
}

// update
export const updateItem = async ({ id, data }) => {
  const res = await request.put(`/models/${id}`, data)
  return res
}

//delete
export const deleteItem = async (id) => {
  const res = await request.delete(`/models/${id}`)
  return res
}

// upload
export const postModelFiles = async (data) => {
  const res = await request.post("/model-files", data)
  return res
}

// getAttr
export const getAttributes = async () => {
  const res = await request.get("/attributes")
  return res.data
}
