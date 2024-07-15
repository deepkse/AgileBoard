import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const TaskCard = ({ task, index, moveTask, columnId }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, index, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Paper
      ref={drag}
      elevation={2}
      style={{
        padding: '0.5rem',
        marginBottom: '0.5rem',
        backgroundColor: '#f5f5f5',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      <Typography variant="subtitle1">{task.title}</Typography>
      <Typography variant="body2">{task.description}</Typography>
      <Typography variant="caption">Assignee: {task.assignee}</Typography>
      <Typography variant="caption" style={{ marginLeft: '0.5rem' }}>
        Label: {task.label}
      </Typography>
    </Paper>
  );
};

const Column = ({ column, tasks, moveTask }) => {
  const [, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item, monitor) => {
      if (item.columnId !== column.id) {
        moveTask(item.id, item.columnId, column.id);
      }
    },
  }));

  return (
    <Paper elevation={3} style={{ padding: '1rem' }} ref={drop}>
      <Typography variant="h6" gutterBottom>
        {column.title}
      </Typography>
      <div style={{ minHeight: '300px' }}>
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            moveTask={moveTask}
            columnId={column.id}
          />
        ))}
      </div>
    </Paper>
  );
};

function App() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', label: '' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleAddTask = () => {
    setTasks(prevTasks => ({
      ...prevTasks,
      todo: [...prevTasks.todo, { id: Date.now().toString(), ...newTask }],
    }));
    setNewTask({ title: '', description: '', assignee: '', label: '' });
    handleClose();
  };

  const moveTask = (taskId, sourceColumnId, targetColumnId) => {
    setTasks(prevTasks => {
      const sourceColumn = [...prevTasks[sourceColumnId]];
      const targetColumn = [...prevTasks[targetColumnId]];
      const taskIndex = sourceColumn.findIndex(task => task.id === taskId);
      const [task] = sourceColumn.splice(taskIndex, 1);
      targetColumn.push(task);
      return {
        ...prevTasks,
        [sourceColumnId]: sourceColumn,
        [targetColumnId]: targetColumn,
      };
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Agile Board</Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            style={{ marginBottom: '1rem' }}
          >
            Add Task
          </Button>
          <Grid container spacing={3}>
            {COLUMNS.map((column) => (
              <Grid item xs={12} md={4} key={column.id}>
                <Column
                  column={column}
                  tasks={tasks[column.id]}
                  moveTask={moveTask}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newTask.title}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={newTask.description}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="assignee"
              label="Assignee"
              type="text"
              fullWidth
              variant="outlined"
              value={newTask.assignee}
              onChange={handleInputChange}
            />
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel>Label</InputLabel>
              <Select
                name="label"
                value={newTask.label}
                onChange={handleInputChange}
                label="Label"
              >
                <MenuItem value="Bug">Bug</MenuItem>
                <MenuItem value="Feature">Feature</MenuItem>
                <MenuItem value="Improvement">Improvement</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAddTask} variant="contained" color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;