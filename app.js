const data = [
  {
    'folder': true,
    'title': 'Grow',
    'children': [
      {
        'title': 'logo.png'
      },
      {
        'folder': true,
        'title': 'English',
        'children': [
          {
            'title': 'Present_Perfect.txt'
          }
        ]
      }
    ]
  },
  {
    'folder': true,
    'title': 'Soft',
    'children': [
      {
        'folder': true,
        'title': 'NVIDIA',
        'children': null
      },
      {
        'title': 'nvm-setup.exe'
      },
      {
        'title': 'node.exe'
      }
    ]
  },
  {
    'folder': true,
    'title': 'Doc',
    'children': [
      {
        'title': 'project_info.txt'
      }
    ]
  },
  {
    'title': 'credentials.txt'
  }
];

const rootNode = document.getElementById('root');

const LIST_MARGIN = 25
document.oncontextmenu = () => false

let createHTMLString = (tag, clas, innerValue) => {
  return `<${tag} class='${clas}'>${innerValue}</${tag}>`
}

let createEmptyElement = () => {
  let empty = document.createElement('div')
  empty.classList.add('wrapper', 'emptyBlock')
  empty.style.marginLeft += `${LIST_MARGIN}px`
  empty.innerHTML = createHTMLString('span', 'emptyText', 'Folder is empty')
  
  return empty
}

let createFolderStructure = (root, data, marginSize = 0) => {
  let list = document.createElement('div')
  list.classList.add('wrapper')

  for (let item of data) {
    let img = item.folder 
      ? '<i class="material-icons">folder</i>' 
      : '<i class="material-icons">insert_drive_file</i>'

    let listItem = document.createElement('div')
    listItem.innerHTML = `${img}${item.title}`
    listItem.classList.add('listItem', `${item.folder ? 'folder' : 'file'}`)

    let listItemContainer = document.createElement('div')
    listItemContainer.classList.add('listItemContainer')
    listItemContainer.style.marginLeft += `${'' + marginSize}px`
    listItemContainer.appendChild(listItem)

    if (item.folder && item.children) {
      createFolderStructure(listItemContainer, item.children, LIST_MARGIN)
    } else if (item.folder && !item.children) {
      let empty = createEmptyElement()
      listItemContainer.appendChild(empty)
    }
    
    list.appendChild(listItemContainer)
  }

  root.appendChild(list)
}

createFolderStructure(rootNode, data)

//Event Listeners for folders
let folderItems = document.querySelectorAll('.listItem.folder')

for (let i = 0; i < folderItems.length; i++) {
  folderItems[i].addEventListener('click', e => {
    let currentItem = e.currentTarget
  
    if (!currentItem.hasAttribute('opened')) {
      currentItem.setAttribute('opened', '')
      currentItem.firstChild.innerHTML = 'folder_open'
    } else {
      currentItem.removeAttribute('opened')
      currentItem.firstChild.innerHTML = 'folder'
    }
    currentItem.nextSibling.classList.toggle('active')
  })
}

//Context menu
let cteateContextMenu = () => {
  let targetItem
  let ctxtMenu = document.createElement('div')
  ctxtMenu.classList.add('contextMenu')

  let renameBtn = document.createElement('button')
  renameBtn.setAttribute('disabled', '')
  renameBtn.classList.add('contextBtn', 'rename')
  renameBtn.innerHTML = 'Rename'

  let deleteBtn = document.createElement('button')
  deleteBtn.setAttribute('disabled', '')
  deleteBtn.classList.add('contextBtn', 'delete')
  deleteBtn.innerHTML = 'Delete item'

  ctxtMenu.appendChild(renameBtn)
  ctxtMenu.appendChild(deleteBtn)

  //ContextMenu Fuctions 
  let setTarget = (target) => {
    targetItem = target.nodeName === 'I' 
      ? target.parentNode 
      : target
  }

  let activateTarget = isActive => {
    if (targetItem) {
      isActive 
        ? targetItem.style.backgroundColor = 'rgb(124, 217, 245)' 
        : targetItem.removeAttribute('style')
    }
  }

  let renameItem = () => {
    enableInput(targetItem, activateTarget)
    ctxtMenu.style.display = 'none'
  }

  let deleteItem = () => {
    let empty = createEmptyElement()
    if (targetItem.parentNode.parentNode.childNodes.length === 1) {
      targetItem.parentNode.parentNode.replaceChild(empty, targetItem.parentNode)
    }
    targetItem.parentNode.remove()
    ctxtMenu.style.display = 'none'
  }

  renameBtn.addEventListener('click', renameItem)
  deleteBtn.addEventListener('click', deleteItem)

  rootNode.appendChild(ctxtMenu)

let disableBtns = isDis => {
  if (isDis) {
    renameBtn.setAttribute('disabled', '')
    deleteBtn.setAttribute('disabled', '')
  } else {
    renameBtn.removeAttribute('disabled')
    deleteBtn.removeAttribute('disabled')
  }
}

let closeContextMenu = e => {
  let target = e.target 
  let isTarget = target === ctxtMenu || ctxtMenu.contains(target)

  if (!isTarget) {
    ctxtMenu.style.display = 'none'
  }
}

return {
        ctxtMenu, 
        renameBtn, 
        deleteBtn, 
        closeContextMenu, 
        disableBtns, 
        setTarget, 
        activateTarget
      }
}

let menu = cteateContextMenu()

function enableInput(targetItem, activateTarget) {
  let input = document.createElement('input')
  input.classList.add('listInput')
  input.setAttribute('value', `${targetItem.childNodes[1].nodeValue}`)
  targetItem.replaceChild(input, targetItem.childNodes[1])

  let closeInput = () => {
    let text = document.createTextNode(`${input.value}`)
    targetItem.replaceChild(text, targetItem.childNodes[1])

    activateTarget(false)
    input.removeEventListener('blur', closeInput)
  }

  input.select()
  input.addEventListener('blur', closeInput)

  return input
}

document.addEventListener('click', menu.closeContextMenu)

//Event Listener for Context Menu
rootNode.addEventListener('contextmenu', e => {
  let target = e.target
  let {ctxtMenu, activateTarget, disableBtns, setTarget} = menu

  ctxtMenu.style.display = 'block'
  ctxtMenu.style.top = `${e.clientY}px`
  ctxtMenu.style.left = `${e.clientX}px`

  activateTarget(false)

  if (target.classList.contains('listItem') || target.parentNode.classList.contains('listItem')){
    disableBtns(false)
    setTarget(target)
    activateTarget(true)
  } else {
    disableBtns(true)
  }
})