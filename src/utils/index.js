/**
 * 将路径数组解析为嵌套对象结构
 * @param {string[]} paths - 路径数组
 * @returns {Object} 嵌套对象结构
 */
export const buildNestedObject = (paths) => {
  const root = {}

  paths.forEach((path) => {
    const parts = path.split("/").filter(Boolean) // 分割路径，移除空字符串
    let current = root

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {} // 最后一层是文件，标记为 null
      }
      current = current[part]
    })
  })

  return root
}
/**
 * 将嵌套对象转换为树形结构
 * @param {Object} obj - 嵌套对象结构
 * @param {string} parentKey - 当前节点路径（递归时使用）
 * @returns {Array} 树形结构数组
 */
export const convertToTreeData = (obj, parentKey = "") => {
  return Object.entries(obj).map(([key, value]) => {
    const nodeKey = parentKey ? `${parentKey}/${key}` : key

    if (value === null) {
      // 文件节点
      return { name: key, title: key, key: nodeKey, isLeaf: true }
    }

    // 文件夹节点
    return {
      name: key,
      title: key,
      key: nodeKey,
      children: convertToTreeData(value, nodeKey),
    }
  })
}

// /**
//  * 根据路径数组生成树形结构
//  * @param {string[]} paths - 路径数组
//  * @returns {Array} 树形结构数组
//  */
// const generateTreeData = (paths) => {
//   const tree = [] // 根节点数组
//   const nodeMap = new Map() // 路径节点映射

//   paths.forEach((path) => {
//     const parts = path.split("/").filter(Boolean) // 分割路径
//     let parent = tree // 从根节点开始
//     let currentPath = "" // 累积路径

//     parts.forEach((part, index) => {
//       currentPath += (currentPath ? "/" : "") + part // 当前完整路径

//       if (!nodeMap.has(currentPath)) {
//         const newNode = {
//           title: part,
//           key: currentPath,
//           isLeaf: index === parts.length - 1, // 最后一层是叶子节点
//           children: [],
//         }

//         parent.push(newNode) // 添加新节点到当前父级
//         nodeMap.set(currentPath, newNode) // 存储节点引用
//       }

//       parent = nodeMap.get(currentPath).children // 更新父级为当前节点的 children
//     })
//   })

//   return tree
// }

/**
 * 1. 路径裁剪：通过 baseLevel 指定需要保留的层级(控制从哪一层开始生成路径) 例如：
 * •	如果 baseLevel = 2，保留从 temFiles/beef9ab8a2781ec708547b00d44cb371.hlsf/hlsf 开始的路径，即从 hlsf 开始。
 * 2. id 字段处理*
 * •	对于文件：直接添加 id。
 * •	对于文件夹：id 设为空字符串 ""，也可以根据需要完全省略。
	
 * 测试数据
  const data = [
    {
      id: "07854e5e-9c32-4c8e-8669-4fa2ae7f4c87",
      url: "temFiles/beef9ab8a2781ec708547b00d44cb371.hlsf/hlsf/low/kuangjia_basecolor.webp",
    },
    ...
  ]
 * 结果数据
  [
    {
      "name": "hlsf",
      "path": "hlsf",
      "children": [
        {
          "name": "low",
          "path": "hlsf/low",
          "children": [
            {
              "name": "kuangjia_basecolor.webp",
              "path": "hlsf/low/kuangjia_basecolor.webp",
              "id": "07854e5e-9c32-4c8e-8669-4fa2ae7f4c87"
            },
            ...
            {
              "name": "pige",
              "path": "hlsf/low/pige",
              "children": [
                {
                  "name": "zuodian_basecolor.webp",
                  "path": "hlsf/low/pige/zuodian_basecolor.webp",
                  "id": "0cf5e684-1618-4da9-8d6b-cf10e21a1582"
                },
                ...
              ]
            }
          ]
        }
      ]
    }
  ]
 * 
*/

export const buildTreeWithLimitedDepth = (objects, baseLevel = 2) => {
  const tree = {}

  if (!objects?.length) return []
  objects.length > 0 &&
    objects.forEach((item) => {
      // 移除前缀部分，仅保留从目标层开始的路径
      const relativePath = item.url.split("/").slice(baseLevel).join("/")
      const parts = relativePath.split("/")
      const { id, model_id, aliases } = item

      let currentNode = tree

      parts.forEach((part, index) => {
        const currentKey = parts.slice(0, index + 1).join("/")
        const isFile = index === parts.length - 1 // 判断是否是文件
        if (!currentNode[part]) {
          currentNode[part] = isFile
            ? {
                name: part,
                key: id || currentKey,
                path: currentKey,
                id,
                model_id,
                aliases,
                isLeaf: true,
              }
            : {
                name: part,
                key: currentKey,
                path: currentKey,
                id: currentKey,
                model_id: currentKey,
                aliases: "",
                isLeaf: false,
                children: {},
              }
        }
        if (!isFile) {
          currentNode = currentNode[part].children // 进入子节点
        }
      })
    })

  // 转换对象树为数组结构
  function convertToArray(node) {
    return Object.values(node).map((item) => {
      if (item.children) {
        item.children = convertToArray(item.children)
      }
      return item
    })
  }

  return convertToArray(tree)
}

// delete node
export const deleteNodeById = (tree, idToDelete) => {
  return tree
    .filter((node) => node.id !== idToDelete) // 过滤掉匹配的节点
    .map((node) => {
      if (node.children) {
        // 递归删除子节点
        return { ...node, children: deleteNodeById(node.children, idToDelete) }
      }
      return node
    })
}

// insert node
export const insertNodeById = (tree, parentId, newNode) => {
  return tree.map((node) => {
    if (node.id === parentId) {
      // 找到目标节点，在其 children 中插入新节点
      return {
        ...node,
        children: node.children ? [...node.children, newNode] : [newNode],
      }
    }
    // 递归更新子节点
    if (node.children) {
      return {
        ...node,
        children: insertNodeById(node.children, parentId, newNode),
      }
    }
    return node // 其他节点保持不变
  })
}
// update field node
export const updateFieldRecursive = (nodes, key, field, value) => {
  for (let node of nodes) {
    if (node.key === key) {
      node[field] = value // 修改字段
      return true // 找到目标节点后终止递归
    }
    if (node.children) {
      const found = updateFieldRecursive(node.children)
      if (found) return true // 继续向上返回
    }
  }
  return nodes
}
