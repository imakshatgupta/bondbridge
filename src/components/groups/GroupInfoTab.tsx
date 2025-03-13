import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { 
  setName, 
  setDescription, 
  setImage
} from "../../store/createGroupSlice";
import { RootState } from "../../store";

const GroupInfoTab: React.FC = () => {
  const dispatch = useDispatch();
  const { name, description, image } = useSelector(
    (state: RootState) => state.createGroup
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setName(e.target.value));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setDescription(e.target.value));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      dispatch(setImage(event.target.files[0]));
    }
  };

  const handlePhotoClick = () => {
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="photo" className="text-center block">
          Group Photo
        </Label>
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {image ? (
              <img
                src={image instanceof File ? URL.createObjectURL(image) : image}
                alt="Group"
                className="w-full h-full object-cover cursor-pointer"
                onClick={handlePhotoClick}
              />
            ) : (
              <button
                className="absolute inset-0 flex items-center justify-center"
                onClick={handlePhotoClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="name" className="">
          Name
        </Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter group name"
        />
      </div>

      <div>
        <Label htmlFor="description" className="">
          Description
        </Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Describe what your group is about"
        />
      </div>
    </div>
  );
};

export default GroupInfoTab;