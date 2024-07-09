import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    // const submit = async (data) => {
    //     if (post) {
    //         const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

    //         if (file) {
    //             appwriteService.deleteFile(post.featuredImage);
    //         }

    //         const dbPost = await appwriteService.updatePost(post.$id, {
    //             ...data,
    //             featuredImage: file ? file.$id : undefined,
    //         });

    //         if (dbPost) {
    //             navigate(`/post/${dbPost.$id}`);
    //         }
    //     } else {
    //         const file = await appwriteService.uploadFile(data.image[0]);

    //         if (file) {
    //             const fileId = file.$id;
    //             data.featuredImage = fileId;
    //             const dbPost = await appwriteService.createPost({ ...data, userId: userData.$id });

    //             if (dbPost) {
    //                 navigate(`/post/${dbPost.$id}`);
    //             }
    //         }
    //     }
    // };
    const submit = async (data) => {
        console.log("Form data:", data);
        console.log("User data:", userData);
    
        try {
            if (post) {
                console.log("Updating post...");
                const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;
    
                if (file) {
                    console.log("Deleting old file...");
                    await appwriteService.deleteFile(post.featuredimage);
                }
    
                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredimage: file ? file.$id : undefined,
                });
    
                if (dbPost) {
                    console.log("Post updated, navigating...");
                    navigate(`/post/${dbPost.$id}`);
                }
            } else {
                console.log("Creating new post...");
    
                // Check if the file upload is successful
                const file = await appwriteService.uploadFile(data.image[0]);
                console.log("File upload response:", file);
    
                if (file) {
                    console.log("File uploaded, creating post...");
                    const fileId = file.$id;
                    data.featuredimage = fileId;
                    
                    // Check if userData contains a valid user ID
                    if (!userData || !userData.$id) {
                        throw new Error("User ID is missing in userData.");
                    }
    
                    // Create the post
                    const dbPost = await appwriteService.createPost({ ...data, userid: userData.$id });
                    console.log("Create post response:", dbPost);
    
                    if (dbPost) {
                        console.log("Post created, navigating...");
                        navigate(`/post/${dbPost.$id}`);
                    } else {
                        throw new Error("Failed to create post.");
                    }
                } else {
                    throw new Error("File upload failed.");
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };
    

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFilePreview(post.featuredimage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}