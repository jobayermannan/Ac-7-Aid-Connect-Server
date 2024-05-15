







const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		 cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		 cb(null, file.fieldname + '-' + Date.now());
	}
});
const upload = multer({ storage: storage });



app.post('/upload', upload.single('myFile'), (req, res) => {
	const file = req.file;
	console.log(file)
	if (!file) {
	  return res.status(400).send('No file uploaded.');
	}
	const imageUrl = `/uploads/${file.filename}`;
	res.send(`File uploaded successfully. Access it at: ${imageUrl}`);
 });
 





 