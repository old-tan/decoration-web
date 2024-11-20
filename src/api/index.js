import axios from "axios"
export const getList = async () => {
  const res = await axios.get("http://localhost:3030/models")
  console.log("res---", res)
  return await res.data.data
}

export const postItem = async (data) => {
  const res = await axios.post("http://localhost:3030/models", { ...data })
  console.log("res---", res)
}

export const uploadFile = async () => {
  // const res = await axios.post("http://localhost:3030/models", { ...data })
}
