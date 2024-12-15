import React, { useState, useEffect } from "react";
import MaterialTable from "@material-table/core";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  MenuItem,
  Select,
  FormControl,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";

const DataTable = () => {
  const [data, setData] = useState([]); // API data
  const [filteredData, setFilteredData] = useState([]); // Data displayed in the table
  const [statusFilter, setStatusFilter] = useState(""); // Selected filter value

  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [isAdding, setIsAdding] = useState(false); // Add new task modal state
  const [newTask, setNewTask] = useState({
    id: "",
    title: "",
    completed: false,
  });

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((resp) => resp.json())
      .then((resp) => {
        setData(resp);
        setFilteredData(resp.slice(0, 20)); // Initially show all data
      });
  }, []);

  // Handle Status Filter
  const handleStatusFilterChange = (event) => {
    const value = event.target.value;
    setStatusFilter(value);

    if (value === "To Do") {
      setFilteredData(data.filter((item) => !item.completed));
    } else if (value === "Done") {
      setFilteredData(data.filter((item) => item.completed));
    } else {
      setFilteredData(data); // Show all if no filter is applied
    }
  };

  const totalTasks = data.length;
  const totalToDo = data.filter((task) => !task.completed).length;
  const totalDone = data.filter((task) => task.completed).length;

  const handleAddTask = () => {
    setIsAdding(true);
    setNewTask({
      id: data.length + 1, // Generate a new ID
      title: "",
      completed: false,
    });
  };

  // Open Edit Modal
  const handleEdit = (row) => {
    setIsEditing(true);
    setEditingTask({ ...row });
  };

  // Close Edit Modal
  const resetEditing = () => {
    setIsEditing(false);
    setEditingTask(null);
  };

  const handleSaveNewTask = () => {
    // Add the new task to the data array
    const updatedData = [...data, newTask];
    setData(updatedData);

    // Update the filtered data based on the current filter
    if (statusFilter === "To Do") {
      setFilteredData(updatedData.filter((item) => !item.completed));
    } else if (statusFilter === "Done") {
      setFilteredData(updatedData.filter((item) => item.completed));
    } else {
      setFilteredData(updatedData); // Show all if no filter is applied
    }

    setIsAdding(false);
    toast.success("Task added successfully!");
  };

  const saveEditing = () => {
    // Update data
    const updatedData = data.map((item) =>
      item.id === editingTask.id ? editingTask : item
    );
    setData(updatedData);

    // Update filtered data (apply current filter)
    if (statusFilter === "To Do") {
      setFilteredData(updatedData.filter((item) => !item.completed));
    } else if (statusFilter === "Done") {
      setFilteredData(updatedData.filter((item) => item.completed));
    } else {
      setFilteredData(updatedData); // Show all if no filter is applied
    }

    resetEditing();
    toast.success("Task updated successfully!");
  };

  // Delete Task
  const handleDelete = (row) => {
    setData((prevData) => prevData.filter((item) => item.id !== row.id));
    setFilteredData((prevData) =>
      prevData.filter((item) => item.id !== row.id)
    );
    toast.success("Task deleted successfully!");
  };

  const columns = [
    { field: "id", title: "TASK ID", width: 20 },
    { field: "title", title: "TITLE", width: 200 },
    { field: "description", title: "DESCRIPTION", width: 450 },
    {
      field: "completed",
      title: (
        <FormControl>
          <h5 style={{ fontWeight: 500, textAlign: "center" }}>
            Status Filter
          </h5>
          <Select
            value={statusFilter}
            displayEmpty
            onChange={handleStatusFilterChange}
            style={{ fontSize: "14px", width: "150px", height: "30px" }}
          >
            <MenuItem value="">
              All <span> ({totalTasks})</span>
            </MenuItem>
            <MenuItem value="To Do">
              To Do <span> ({totalToDo})</span>
            </MenuItem>
            <MenuItem value="Done">
              Done <span> ({totalDone})</span>
            </MenuItem>
          </Select>
        </FormControl>
      ),
      render: (rowData) => <span>{rowData.completed ? "Done" : "To Do"}</span>,
    },
    {
      field: "edit",
      title: "EDIT",
      render: (rowData) => (
        <EditIcon
          onClick={() => handleEdit(rowData)}
          style={{ color: "red", cursor: "pointer" }}
        />
      ),
    },
    {
      field: "delete",
      title: "DELETE",
      render: (rowData) => (
        <DeleteIcon
          onClick={() => handleDelete(rowData)}
          style={{ color: "red", cursor: "pointer" }}
        />
      ),
    },
  ];

  return (
    <div className="table">
      {/* Add Task Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddTask}
        style={{ margin: "20px 0" }}
      >
        Add New Task
      </Button>

      <MaterialTable
        title="Task List Manager"
        columns={columns}
        data={filteredData}
        options={{
          search: true,
        }}
      />

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Edit Modal */}
      <Dialog open={isEditing} onClose={resetEditing}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            <Input
              fullWidth
              placeholder="Title"
              value={editingTask?.title || ""}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
            />
          </Typography>
          <Typography gutterBottom>
            <Select
              fullWidth
              value={editingTask?.completed ? "Done" : "To Do"}
              onChange={(e) =>
                setEditingTask({
                  ...editingTask,
                  completed: e.target.value === "Done",
                })
              }
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetEditing} color="secondary">
            Cancel
          </Button>
          <Button onClick={saveEditing} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={isAdding} onClose={() => setIsAdding(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            value={newTask.title}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
          />

          {/* Dropdown for Completed Status */}
          <FormControl fullWidth style={{ marginTop: "16px" }}>
            <Select
              value={newTask.completed ? "Done" : "To Do"}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  completed: e.target.value === "Done",
                }))
              }
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAdding(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveNewTask} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DataTable;
