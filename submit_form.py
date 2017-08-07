from flask_wtf import FlaskForm
from wtforms import TextField, SubmitField

class SimpleForm(FlaskForm):
    video_id = TextField("Enter Youtube Video Id", render_kw={"placeholder": "Enter the valid public YouTube Video Id"})
    submit = SubmitField("Submit")
