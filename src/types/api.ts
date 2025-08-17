export type APISound = { id: string, user_guild_id: string, original_name: string, mime_type: string, created_at: string };
export type APISetting = { user_guild_id: string, active_sound_id: string | null, mode: "single" | "random" };

export type FailedFile = {
    filename: string,
    error: string,
    index: number
}
export type SuccessFile = {
    id: string,
    original_name: string,
    size: number
    mime_type: string
}

export type APIUploadResponse = {
    status: "failure" | "partial" | "success",
    total_files: number,
    success_count: number,
    failure_count: number,
    successful_files: SuccessFile[],
    failed_files: FailedFile[],
    message: string
}
