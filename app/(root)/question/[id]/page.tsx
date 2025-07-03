export default async function QuestionDetails({ params }: RouteParams) {
  const { id } = await params;

  console.log(id);

  return (
    <div>

    </div>
  );
}
