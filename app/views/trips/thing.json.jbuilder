json.extract! @thing_image, :id, :thing_id, :image_id, :priority, :creator_id, :created_at, :updated_at
json.thing_name @thing_image.thing_name        if @thing_image.respond_to?(:thing_name)
json.image_caption @thing_image.image_caption  if @thing_image.respond_to?(:image_caption)
json.image_content_url image_content_url(@thing_image.image_id)    if @thing_image.image_id

if @thing_image.respond_to?(:lng) && @thing_image.lng
  json.position do
    json.lng @thing_image.lng
    json.lat @thing_image.lat
  end
end
