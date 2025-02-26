import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { list, ListAllWithPathOutput, uploadData, UploadDataWithPathInput } from "aws-amplify/storage";
import { StorageImage } from "@aws-amplify/ui-react-storage";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [content, setContent] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [file, setFile] = useState<File>();
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [storageOutput, setStorageOutput] = useState<ListAllWithPathOutput>();
  const [photoUrl, setPhotoUrl] = useState('');
  const { user, signOut } = useAuthenticator();

  const fetch = async() => {
    const result = await list({
      path: 'profile-pictures/',
      options: {
        listAll: true,
      }
    });
    return result;
  }

  useEffect(() => {
    fetch().then((res) => {
      setStorageOutput(res);
    }).catch((err) => {
      alert(err);
    })
  }, []);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content});
    toggleCreateModal();
  }

  function editTodo() {
    client.models.Todo.update({id: selectedId, content: updatedContent});
    toggleEditModal();
  }
  function deleteTodo(id: string) {
    client.models.Todo.delete({id});
    alert('Delete Success');
  }
  const toggleCreateModal = () => {
    setShowCreateModal((prev) => !prev);
  }

  const toggleEditModal = () => {
    setShowEditModal((prev) => !prev);
  }

  const toggleFileUploadModal = () => {
    setShowFileUploadModal((prev) => !prev);
  }

  const uploadFile = () => {
    if(!file) return;
    uploadData({
      path: `profile-pictures/${file.name}`,
      data: file
    }).result.then((res) => {
      console.log(res.path);
      setPhotoUrl(res.path);
      setShowFileUploadModal(false);
    });
  }

  return (
    <><div className="card">
      <div className="header">
        <div className="username">Hello, {user.signInDetails?.loginId} </div>
        <button className="logout-button" onClick={signOut}>Logout</button>
      </div>
    <div className="card-header">
      <div className="card-title">ToDo List</div>
      <button className="edit-btn" onClick={toggleCreateModal}>+ Add</button>
    </div>
    <ul>
      {
        todos.map((todo) => (<li>
          {todo.content}
          <div>
            <button className="edit-btn" onClick={() => {
              toggleEditModal();
              setSelectedId(todo.id);
              setUpdatedContent(todo.content ?? '');
            }}>Edit</button>
            <button className="delete-btn" onClick={() => {
              deleteTodo(todo.id);
            }}>Delete</button>
          </div>
        </li>))
      }
    </ul>
  </div>  
  <div className="upload-view">
    <button className="submit-button" type="submit" onClick={toggleFileUploadModal}>Upload Photo</button>
  </div>
  {showCreateModal && <div className="modal-overlay" id="modal">
    <div className="modal">
      <button className="close-button" onClick={toggleCreateModal}>&times;</button>
      <input type="text" placeholder="Enter Todo content" value={content} onChange={(e) => {
        setContent(e.target.value);
      }}/>
      <div className="modal-footer">
      <button className="submit-button" type="submit" onClick={createTodo}>Submit</button>
      </div>
    </div>
  </div>}
  {photoUrl && <StorageImage alt="profile" path={photoUrl} />}
  {showEditModal && <div className="modal-overlay" id="modal">
    <div className="modal">
      <button className="close-button" onClick={toggleEditModal}>&times;</button>
      <input type="text" placeholder="Enter Todo content" value={updatedContent} onChange={(e) => {
        setUpdatedContent(e.target.value);
      }}/>
      <div className="modal-footer">
      <button className="submit-button" type="submit" onClick={editTodo}>Edit</button>
      </div>
    </div>
  </div>}
  {showFileUploadModal && <div className="modal-overlay" id="modal">
    <div className="modal">
      <button className="close-button" onClick={toggleFileUploadModal}>&times;</button>
      <input type="file" onChange={(e) => {
        setFile(e.target.files?.[0]);
      }} />
      <button className="submit-button" onClick={uploadFile}>Upload</button>
    </div>
  </div>}
  </>
  );
}

export default App;
