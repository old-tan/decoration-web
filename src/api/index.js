import axios from "axios"
export const getList = async () => {
  const res = await axios.get("http://localhost:3030/uploads")
  console.log("res---", res)
  return await res.data.data
}

export const postItem = async (data) => {
  const res = await axios.post("http://localhost:3030/uploads", { ...data })
  console.log("res---", res)
}
