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

// create model
export const postItem = async (data) => {
  const res = await request.post("/models", data)
  return res
}

// patch model
export const updateItem = async ({ id, data }) => {
  const res = await request.put(`/models/${id}`, data)
  return res
}

// delete model
export const deleteItem = async (id) => {
  const res = await request.delete(`/models/${id}`)
  return res
}

// patch model-file
export const updateModelFiles = async ({ id, data }) => {
  console.log(id, data)
  const res = await request.patch(`/model-files/${id}`, data)
  return res
}

// delete model-file
export const deleteModelFile = async (id) => {
  const res = await request.delete(`/model-files/${id}`)
  return res
}

// getAttr
export const getAttributes = async () => {
  const res = await request.get("/attributes")
  return res.data
}

// getModelAttr
export const getModelAttributes = async (params) => {
  const res = await request.get(`/model-attributes`, params)
  console.log("res---", res)
  return res.data.data
}

// get model files
export const getModelFiles = async (params) => {
  const res = await request.get("/model-files", params)
  return res.data
}
